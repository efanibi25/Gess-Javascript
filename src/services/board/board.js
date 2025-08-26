
const { Block } = require("./block.js");
const { Piece } = require("./piece.js");
const { BoardMax, squaresCount, sideborder, TEST_MODE_ONE_PLAYER_CONTROLS_ALL, TEST_MODE_REMOVE_DIRECTION_CHECK, TEST_MODE_ALLOW_ANY_DIRECTION, TEST_MODE_UNLIMITED_MOVE_DISTANCE } = require("../../shared/config.js");

// The Board class manages all game logic.
class Board {
    // =================================================================
    // --- 1. Constructor & Initialization ---
    // =================================================================

    constructor(pieces, opponent, rings, oppRings, number, socket) {
        this.myPieces = new Set(pieces);
        this.opponentPieces = new Set(opponent);
        this.rings = new Set(rings);
        this.opponentRings = new Set(oppRings);
        this.board = [];
        this.playerNumber = number;
        this.socket = socket;
        
        this.createBoard();
        this.addPieces();
    }

    createBoard() {
        let i = 0, k = 0, count = 0;
        while (i < squaresCount + sideborder) {
            k = 0;
            while (k < squaresCount + sideborder) {
                this.board.push(new Block(count, i, k, this));
                count++;
                k++;
            }
            i++;
        }
    }

    addPieces() {
        for (let i = 0; i < Math.pow(squaresCount + sideborder, 2); i++) {
            let block = this.board[i];
            if (block.isGameBlock()) {
                block.piece = new Piece(block.index, block.row, block.col, this);
                if (this.myPieces.has(i + 1)) {
                    block.piece.owner = "mine";
                } else if (this.opponentPieces.has(i + 1)) {
                    block.piece.owner = "opponent";
                }
            }
        }
    }

    // =================================================================
    // --- 2. Core Gameplay Loop ---
    // (High-level methods called by the server)
    // =================================================================

processMove(startIndex, endIndex, socket) {
    // 1. Initial Setup & Basic Check
    const startBlock = this.getBlock(startIndex);
    if (!startBlock || !startBlock.piece) {
        return { success: false, message: "You must select a piece to move." };
    }
    const neighbors = this.getNeighborsOf(startBlock.piece.index);

    // 2. Run Validation Phases
    const validationSteps = [
        this._validateOwnershipAndTurn(socket, neighbors),
        this._validateBlockIntegrity(neighbors),
        this._validateMovePath(startIndex, endIndex, neighbors)
    ];

    for (const errorMessage of validationSteps) {
        if (errorMessage) {
            return { success: false, message: errorMessage };
        }
    }
    
    // 3. If all checks pass, the move is valid
    return { success: true, message: "Move successful!" };
}


/**
 * Phase 1: Validates piece ownership and the current player's turn.
 * @returns {string|null} An error message string if invalid, otherwise null.
 */
_validateOwnershipAndTurn(socket, neighbors) {
    const containsOpponentPieces = Object.values(neighbors).some(p => p && p.owner === "opponent");
    const containsOwnPieces = Object.values(neighbors).some(p => p && p.owner === "mine");
    const isTestMode = TEST_MODE_ONE_PLAYER_CONTROLS_ALL;
    const isPlayersTurn = socket.id === socket.userRoom.currentid;

    if (containsOwnPieces && containsOpponentPieces) {
        return "You cannot move a block containing pieces from both players.";
    }

    if (isTestMode) {
        if (isPlayersTurn && !containsOwnPieces) {
            return "Test Mode: It is Player 1's turn; move Player 1's pieces.";
        }
        if (!isPlayersTurn && containsOwnPieces) {
            return "Test Mode: It is Player 2's turn; move Player 2's pieces.";
        }
      
    } else {
        if (!isPlayersTurn) {
            return "It's not your turn.";
        }
        if (containsOpponentPieces) {
            return "You must move your own pieces.";
        }
    }
    return null; // All ownership checks passed
}

/**
 * Phase 2: Validates the integrity of the 3x3 block itself.
 * @returns {string|null} An error message string if invalid, otherwise null.
 */
_validateBlockIntegrity(neighbors) {
    if (Object.values(neighbors).some(ele => ele === false)) {
        return "The block you selected is not a complete 3x3 square.";
    }
    if (Object.values(neighbors).every(ele => ele && ele.owner == null)) {
        return "You cannot move an empty block.";
    }
    return null; // All integrity checks passed
}

/**
 * Phase 3: Validates the path of the move from start to end.
 * @returns {string|null} An error message string if invalid, otherwise null.
 */
_validateMovePath(startIndex, endIndex, neighbors) {
    const dir = this.getDir(startIndex, endIndex);
    if (!TEST_MODE_ALLOW_ANY_DIRECTION && dir === undefined) {
        return "Your move must be in a straight line (linear).";
    }
    if (dir === 0) {
        return "You must move at least one space.";
    }

    const directionPiece = neighbors[dir];
    const centerPiece = neighbors[0];

    if (!TEST_MODE_ONE_PLAYER_CONTROLS_ALL && directionPiece && directionPiece.owner === "opponent") {
        return "The path is blocked by an opponent's piece.";
    }
    if (!TEST_MODE_REMOVE_DIRECTION_CHECK && (!directionPiece || directionPiece.owner == null)) {
        return "There is no piece in the direction selected";
    }
    if (!TEST_MODE_UNLIMITED_MOVE_DISTANCE && centerPiece.owner == null && dir && Math.abs((startIndex - endIndex) / dir) > 3) {
        return "You cannot move a block more than 3 spaces at once.";
    }
    return null; // All path checks passed
}

/**
 * Calculates the actual final destination of a move, stopping before any obstructions.
 * @param {number} start - The starting index of the move's center.
 * @param {number} end - The player's intended ending index.
 * @returns {number} The index of the actual final destination.
 */
/**
 * Calculates the actual final destination of a move, stopping before any obstructions.
 * @param {number} start - The starting index of the move's center.
 * @param {number} end - The player's intended ending index.
 * @returns {number} The index of the actual final destination.
 */
_calculateFinalDestination(start, end) {
    const dir = this.getDir(start, end);
    if (!dir || dir === 0) {
        return start; // Can't move if there's no direction or not moving.
    }

    const startNeighbors = this.getNeighborsOf(start);
    const blockOffsets = Object.keys(startNeighbors)
        .filter(key => startNeighbors[key] && startNeighbors[key].owner)
        .map(key => parseInt(key));

    const originalPieceIndices = new Set();
    for (const offset of blockOffsets) {
        originalPieceIndices.add(start + offset);
    }

    let lastSafePosition = start;

    const path = [];
    let tempPos = start + dir;
    while ((dir > 0 && tempPos <= end) || (dir < 0 && tempPos >= end)) {
        path.push(tempPos);
        tempPos += dir;
    }

    for (const pathCenter of path) {
        for (const offset of blockOffsets) {
            const projectedIndex = pathCenter + offset;
            const pieceOnBoard = this.getPiece(projectedIndex);

            if (pieceOnBoard && pieceOnBoard.owner && !originalPieceIndices.has(projectedIndex)) {
                // --- THIS IS THE ONLY CHANGE ---
                // Instead of returning the last safe spot, return the spot where the collision happens.
                return pathCenter;
            }
        }
        lastSafePosition = pathCenter;
    }

    // If no obstructions are found, the original 'end' is valid.
    return end;
}    
    updateBoard(start, end) {
        const sets = this.applyMove(start, end);
        const lost = this.checkLose(end);
        const win = this.checkWin(end);
        return { ...lost, ...win, ...sets };
    }

    // =================================================================
    // --- 3. Move Execution Logic ---
    // (Functions that modify the board state)
    // =================================================================

    applyMove(start, end) {
        const startNeighbors = this.getNeighborsOf(start);
        const endNeighbors = this.getNeighborsOf(end);
        const colordict = {};

        for (const key of Object.keys(startNeighbors)) {
            const piece = startNeighbors[key];
            if (piece) colordict[key] = piece.owner;
        }

        for (const piece of Object.values(startNeighbors)) {
            if (piece) {
                piece.owner = null;
                this.myPieces.delete(piece.index);
                this.opponentPieces.delete(piece.index); // Also clear opponent pieces from start
            }
        }

        for (const piece of Object.values(endNeighbors)) {
            if (piece && piece.owner === "opponent") {
                piece.owner = null;
                this.opponentPieces.delete(piece.index);
            }
        }

        for (const key of Object.keys(colordict)) {
            const owner = colordict[key];
            const piece = endNeighbors[key];
            if (piece && owner) {
                piece.owner = owner;
                if (owner === "mine") this.myPieces.add(piece.index);
                else if (owner === "opponent") this.opponentPieces.add(piece.index);
            }
        }

        if (this.playerNumber === 1) {
            return { "player2Pieces": Array.from(this.opponentPieces), "player1Pieces": Array.from(this.myPieces) };
        } else {
            return { "player1Pieces": Array.from(this.opponentPieces), "player2Pieces": Array.from(this.myPieces) };
        }
    }
    
    // =================================================================
    // --- 4. Ring & Win/Loss Logic ---
    // (All functions related to the game's objective)
    // =================================================================

    checkLose(index) {
        const rings = this.updateRings(index);
        if (this.playerNumber === 1) {
            return rings.size === 0 ? { "player1Rings": [], "winner": "Player2" } : { "player1Rings": Array.from(rings) };
        } else {
            return rings.size === 0 ? { "player2Rings": [], "winner": "Player1" } : { "player2Rings": Array.from(rings) };
        }
    }

    checkWin(index) {
        const rings = this.updateOpponentRings(index);
        if (this.playerNumber === 1) {
            return rings.size === 0 ? { "player2Rings": [], "winner": "Player1" } : { "player2Rings": Array.from(rings) };
        } else {
            return rings.size === 0 ? { "player1Rings": [], "winner": "Player2" } : { "player1Rings": Array.from(rings) };
        }
    }

    updateRings(end) {
        this.rings = this._findUpdatedRings(end, this.rings, true);
        console.log(`Player ${this.playerNumber} (mine) now has ${this.rings.size} rings.`);
        return this.rings;
    }

    updateOpponentRings(end) {
        this.opponentRings = this._findUpdatedRings(end, this.opponentRings, false);
        const opponentNumber = this.playerNumber === 1 ? 2 : 1;
        console.log(`Player ${opponentNumber} (opponent) now has ${this.opponentRings.size} rings.`);
        return this.opponentRings;
    }

    _findUpdatedRings(end, existingRings, isMine) {
        const movedPieces = Object.values(this.getNeighborsOf(end));
        let potentialRingIndexes = new Set(existingRings);
        for (const piece of movedPieces) {
            if (piece) {
                this.getRingNeighbors(piece.index).forEach(index => potentialRingIndexes.add(index));
            }
        }
        return new Set(
            Array.from(potentialRingIndexes)
            .filter(index => this.isRingAt(index, isMine))
        );
    }

    isRingAt(index, is_mine = true) {
        const centerPiece = this.getPiece(index);
        if (!centerPiece || centerPiece.owner !== null) return false;

        const neighbors = this.getNeighborsOf(index);
        const requiredOwner = is_mine ? "mine" : "opponent";
        const hasEightNeighbors = Object.values(neighbors).filter(p => p).length === 9;
        if (!hasEightNeighbors) return false;
        
        const allNeighborsOwned = Object.values(neighbors).every(p => !p || p.index === index || p.owner === requiredOwner);
        return allNeighborsOwned;
    }
    
    // =================================================================
    // --- 5. Position & Geometry Helpers ---
    // (Low-level utility functions)
    // =================================================================

    getDir(start, end) {
        const startblock = this.getBlock(start);
        const endblock = this.getBlock(end);
        if (!startblock || !endblock) return undefined;

        const rowchange = endblock.row - startblock.row;
        const colchange = endblock.col - startblock.col;
        if (colchange === 0 && rowchange === 0) return 0;
        if (colchange === 0) return rowchange > 0 ? squaresCount + sideborder : -squaresCount - sideborder;
        if (rowchange === 0) return colchange > 0 ? 1 : -1;
        if (Math.abs(rowchange) !== Math.abs(colchange)) return undefined;
        if (rowchange < 0 && colchange < 0) return -squaresCount - sideborder - 1;
        if (rowchange < 0 && colchange > 0) return -squaresCount - sideborder + 1;
        if (rowchange > 0 && colchange < 0) return squaresCount + sideborder - 1;
        if (rowchange > 0 && colchange > 0) return squaresCount + sideborder + 1;
    }

    getNeighborsOf(index) {
        const out = {};
        const centerPiece = this.getPiece(index);
        if (!centerPiece) return {};
        
        const neighborsDexes = [0, -1, 1, -squaresCount - sideborder, squaresCount + sideborder, squaresCount + sideborder + 1, -squaresCount - sideborder - 1, squaresCount + sideborder - 1, -squaresCount - sideborder + 1];
        for (const offset of neighborsDexes) {
            out[offset] = this.getPiece(index + offset);
        }
        return out;
    }

    getRingNeighbors(index) {
        const piece = this.getPiece(index);
        if (!piece) return [];
        const neighbors = this.getNeighborsOf(piece.index);
        return Object.values(neighbors).filter(p => p).map(p => p.index);
    }
    
    getMaxMovement(start, end) {
        // This function seems complex and may need review, but logic is unchanged.
        const positions = this.getMovementsHelper(start, end);
        const startNeighbors = this.getNeighborsOf(start);
        const excluded_indexes = new Set(Object.values(startNeighbors).map(e => e.index));
        for (const current of positions) {
            for (const key of Object.keys(startNeighbors)) {
                if (startNeighbors[key].owner == null) continue;
                if (excluded_indexes.has(current + parseInt(key))) continue;
                if (this.myPieces.has(current + parseInt(key)) || this.opponentPieces.has(current + parseInt(key))) return current;
            }
        }
        return end;
    }

    getMovementsHelper(start, end) {
        const dir = this.getDir(start, end);
        let positions = [];
        if (dir === 0 || dir === undefined) return positions;
        
        if (dir > 0) {
            for (let current = start + dir; current <= end; current += dir) positions.push(current);
        } else {
            for (let current = start + dir; current >= end; current += dir) positions.push(current);
        }
        return positions;
    }

    // =================================================================
    // --- 6. Basic Accessors ---
    // (Fundamental getter methods)
    // =================================================================

    getBlock(index) {
        if (index < 0 || index >= BoardMax) return undefined;
        return this.board[index - 1];
    }

    getPiece(index) {
        const block = this.getBlock(index);
        return block ? block.piece : undefined;
    }
}

module.exports = { Board };