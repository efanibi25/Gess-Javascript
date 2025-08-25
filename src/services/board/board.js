// board.js
// This file contains the main Board class, which manages the game state.

// Require the Block and Piece classes from their respective files.
const { Block } = require("./block.js");
const { Piece } = require("./piece.js");
const{BoardMax,    squaresCount, 
    sideborder,
    TEST_MODE_ONE_PLAYER_CONTROLS_ALL,
    TEST_MODE_REMOVE_DIRECTION_CHECK,
    TEST_MODE_ALLOW_ANY_DIRECTION,
    TEST_MODE_UNLIMITED_MOVE_DISTANCE} = require("../../shared/config.js");


// The Board class manages all game logic, including piece placement, movement validation, and win/loss conditions.
class Board {
    constructor(pieces, opponent, rings, oppRings, number) {
        this.myPieces = new Set(pieces);
        this.opponentPieces = new Set(opponent);
        this.rings = new Set(rings);
        this.opponentRings = new Set(oppRings);
        this.board = [];
        this.createBoard();
        this.addPieces();
        this.playerNumber = number;
    }
    
    // --- Board Initialization ---
    
    createBoard() {
        let i = 0;
        let k = 0;
        let count = 0;
        while (i < squaresCount + sideborder) {
            k = 0;
            while (k < squaresCount + sideborder) {
                this.board.push(new Block(count, i, k, this));
                count = count + 1;
                k = k + 1;
            }
            i = i + 1;
        }
    }

    addPieces() {
        let i = 0;
        while (i < Math.pow(squaresCount + sideborder, 2)) {
            let block = this.board[i];
            if (block.isGameBlock()) {
                block.piece = new Piece(block.index, block.row, block.col, this);
                if (this.myPieces.has(i + 1)) {
                    block.piece.owner = "mine";
                } else if (this.opponentPieces.has(i + 1)) {
                    block.piece.owner = "opponent";
                }
            }
            i = i + 1;
        }
    }
    
    // --- Piece and Block Accessors ---

    getBlock(index) {
        if (index < 0) return;
        else if (index >= BoardMax) return;
        return this.board[index - 1];
    }

    getPiece(index) {
        let block = this.getBlock(index);
        if (block) {
            return block.piece;
        }
        return block;
    }

    // --- Position and Direction Helpers ---

    getMaxMovement(start, end) {
        let positions = this.getMovementsHelper(start, end);
        let startpiece = this.getPiece(start);
        const startNeighbors = this.getNeighborsOf(start);
        let excluded_indexes = new Set(Object.values(startNeighbors).map(e => e.index));
        for (let current of positions) {
            for (let key of Object.keys(startNeighbors)) {
                if (startNeighbors[key].owner == null) continue;
                else if (excluded_indexes.has(current + parseInt(key))) continue;
                else if (this.myPieces.has(current + parseInt(key) || this.opponentPieces.has(current + parseInt(key)))) return current;
            }
        }
        return end;
    }

    getMovementsHelper(start, end) {
        let dir = this.getDir(start, end);
        let positions = [];

        if (dir > 0) {
            for (let current = start + dir; current < end; current = current + dir) {
                positions.push(current);
            }
        } else {
            for (let current = start + dir; current > end; current = current + dir) {
                positions.push(current);
            }
        }
        return positions;
    }

    getDir(start, end) {
        let startblock = this.getBlock(start);
        let endblock = this.getBlock(end);
        let rowchange = endblock.row - startblock.row;
        let colchange = endblock.col - startblock.col;
        if (colchange == 0 && rowchange == 0) {
            return 0;
        } else if (colchange == 0 && rowchange >= 1) {
            return squaresCount + sideborder;
        } else if (colchange == 0 && rowchange < 0) {
            return -squaresCount - sideborder;
        } else if (rowchange == 0 && colchange >= 1) {
            return 1;
        } else if (rowchange == 0 && colchange < 0) {
            return -1;
        } else if (Math.abs(rowchange) != Math.abs(colchange)) {
            return;
        } else if (rowchange < 0 && colchange < 0) {
            return -squaresCount - sideborder - 1;
        } else if (rowchange < 0 && colchange > 0) {
            return -squaresCount - sideborder + 1;
        } else if (rowchange > 0 && colchange < 0) {
            return squaresCount + sideborder - 1;
        } else if (rowchange > 0 && colchange > 0) {
            return squaresCount + sideborder + 1;
        }
    }

    // --- Ring Logic ---

    checkLose(index) {
        let rings = this.updateRings(index);
        if (rings.size == 0 && this.playerNumber == 1) return { "player1Rings": [], "winner": "Player2" };
        else if (this.playerNumber == 1) return { "player1Rings": Array.from(rings) };
        else if (rings.size == 0 && this.playerNumber == 2) return { "player2Rings": [], "winner": "Player1" };
        else if (this.playerNumber == 2) return { "player2Rings": Array.from(rings) };
    }

    checkWin(index) {
        let rings = this.updateOpponentRings(index);
        if (rings.size == 0 && this.playerNumber == 1) return { "player2Rings": [], "winner": "Player1" };
        else if (this.playerNumber == 1) return { "player2Rings": Array.from(rings) };
        else if (rings.size == 0 && this.playerNumber == 2) return { "player1Rings": [], "winner": "Player2" };
        else if (this.playerNumber == 2) return { "player1Rings": Array.from(rings) };
    }

updateRings(index) {
    let potentialRings = [...Array.from(this.rings), ...this.getRingNeighbors(index)];
    this.rings = new Set(potentialRings.map(e => this.getPiece(e)).filter(e => e != null && e != false && this.isRingAt(e.index, true) == true).map(e => e.index));
    
    // This log is now dynamic
    console.log(`Player ${this.playerNumber} (mine) now has ${this.rings.size} rings.`);

    return this.rings;
}

updateOpponentRings(index) {
    let potentialRings = [...Array.from(this.opponentRings), ...this.getRingNeighbors(index)];
    this.opponentRings = new Set(potentialRings.map(e => this.getPiece(e)).filter(e => e != null && e != false && this.isRingAt(e.index, false) == true).map(e => e.index));
    
    // This log correctly identifies the opponent
    const opponentNumber = this.playerNumber === 1 ? 2 : 1;
    console.log(`Player ${opponentNumber} (opponent) now has ${this.opponentRings.size} rings.`);

    return this.opponentRings;
}

    getRingNeighbors(index) {
        let piece = this.getPiece(index);
        let neighbors = this.getNeighborsOf(piece.index);
        return Object.keys(neighbors).filter(ele => ele != 0).reduce((accumulator, currentValue) => {
            if (neighbors[currentValue] != null) {
                accumulator.push(neighbors[currentValue].index);
            }
            return accumulator;
        }, [piece.index]);
    }

    /**
     * Checks if a ring is formed at the given index.
     * @param {number} index The index of the center of the potential ring.
     * @param {boolean} is_mine True to check for a ring of your pieces, false for an opponent's.
     * @returns {boolean} True if a ring is formed, false otherwise.
     */
    isRingAt(index, is_mine = true) {
        const centerPiece = this.getPiece(index);
        if (centerPiece === null || centerPiece.owner !== null) {
            return false;
        }

        const neighbors = this.getNeighborsOf(index);
        const requiredOwner = is_mine ? "mine" : "opponent";
        const filledNeighborsCount = Object.values(neighbors).filter(
            p => p && p.owner === requiredOwner
        ).length;

        return filledNeighborsCount === 8;
    }
    
    // --- Validation ---
    
    validatePiece(start) {
    let startblock = this.getBlock(start);
    const result = this.testValidBlock(startblock);

    // If result is a string, it's an error message. Otherwise, it's a boolean.
    if (result !== true) {
        return result;
    }
    return true;
}

    testValidBlock(startblock) {
    if (!startblock.piece) {
        // Return a specific error message
        return "You must select a piece to move.";
    }

    const neighbors = this.getNeighborsOf(startblock.piece.index);
    const hasOpponentPieces = Object.values(neighbors).some(p => p && p.owner === "opponent");
    const hasMyPieces = Object.values(neighbors).some(p => p && p.owner === "mine");

    if (!TEST_MODE_ONE_PLAYER_CONTROLS_ALL && hasOpponentPieces) {
        return "You cannot move a block that contains an opponent's piece.";
    }

    if (Object.values(neighbors).filter(ele => ele === false).length > 0) {
        return "The block you selected is not a complete 3x3 square.";
    }
    
    if (Object.values(neighbors).filter(ele => ele).length === 0) {
        return "You cannot move an empty block.";
    }
    
    if (hasMyPieces && hasOpponentPieces) {
        return "You cannot move a block containing both your pieces and opponent's pieces.";
    }

    // All checks passed, return true
    return true;
}

validateMove(start, end) {
    const dir = this.getDir(start, end);
    const startPiece = this.getPiece(start);

    if (!TEST_MODE_ALLOW_ANY_DIRECTION) {
        if (dir === undefined) {
            return "Your move must be in a straight line (linear).";
        }
    }

    if (dir === 0) {
        return "You must move at least one space.";
    }
    
    if (!startPiece) {
        return "No piece selected to move.";
    }

    const startNeighbors = this.getNeighborsOf(startPiece.index);
    const directionPiece = startNeighbors[dir];
    const centerPiece = startNeighbors[0]

    if (!TEST_MODE_ONE_PLAYER_CONTROLS_ALL) {
        if (directionPiece && directionPiece.owner === "opponent") {
            return "The path is blocked by an opponent's piece.";
        }
    }

    if (!TEST_MODE_REMOVE_DIRECTION_CHECK) {
        if (!directionPiece || directionPiece.owner == null) {
            return "You must move a piece that is connected to the selected block.";
        }
    }
    
    if (!TEST_MODE_UNLIMITED_MOVE_DISTANCE &&centerPiece.owner == null) {
        if (dir && Math.abs((start - end) / dir) > 3) {
            return "You cannot move a block more than 3 spaces at once.";
        }
    }
    
    // All checks passed, return true
    return true;
}

/**
 * Finds and returns all 8 neighbors and the center piece for a given index.
 * @param {number} index The index of the center piece of the 3x3 grid.
 * @returns {Object} An object where keys are the offset and values are the Piece objects.
 */
getNeighborsOf(index) {
    const out = {};
    const centerPiece = this.getPiece(index);

    // If the center piece doesn't exist, we can't find its neighbors.
    if (!centerPiece) return {};

    const neighborsDexes = [
        0, -1, 1,
        -squaresCount - sideborder,
        squaresCount + sideborder,
        squaresCount + sideborder + 1,
        -squaresCount - sideborder - 1,
        squaresCount + sideborder - 1,
        -squaresCount - sideborder + 1
    ];

    for (const offset of neighborsDexes) {
        // The key is the offset (e.g., -1 for 'left'), and the value is the Piece object.
        out[offset] = this.getPiece(index + offset);
    }
    
    return out;
}
   updateBoard(start, end) {
        const sets = this.applyMove(start, end);
        const lost = this.checkLose(end);
        const win = this.checkWin(end);
        return { ...lost, ...win, ...sets };
    }
    
    
    /**
     * Applies a move by updating piece owners and the player's piece sets.
     * @param {number} start The starting index of the move.
     * @param {number} end The ending index of the move.
     * @returns {Object} An object containing the updated piece sets.
     */
    applyMove(start, end) {
        const startNeighbors = this.getNeighborsOf(start);
        const endNeighbors = this.getNeighborsOf(end);

        // Store the original owners of the starting neighbors
        const colordict = {};
        for (const key of Object.keys(startNeighbors)) {
            const piece = startNeighbors[key];
            if (piece) {
                colordict[key] = piece.owner;
            }
        }

        // Clear the owners from the original positions and update the sets
        for (const piece of Object.values(startNeighbors)) {
            if (piece) {
                piece.owner = null;
                this.myPieces.delete(piece.index);
            }
        }

        // Clear any opponent pieces from the end position and update the sets
        for (const piece of Object.values(endNeighbors)) {
            if (piece && piece.owner === "opponent") {
                piece.owner = null;
                this.opponentPieces.delete(piece.index);
            }
        }

        // Apply the owners to the new positions and update the sets
        for (const key of Object.keys(colordict)) {
            const owner = colordict[key];
            const piece = endNeighbors[key];
            if (piece && owner) {
                piece.owner = owner;
                if (owner === "mine") {
                    this.myPieces.add(piece.index);
                } else if (owner === "opponent") {
                    this.opponentPieces.add(piece.index);
                }
            }
        }
        
        // Return the updated sets for the response
        if (this.playerNumber === 1) {
            return { "player2Pieces": Array.from(this.opponentPieces), "player1Pieces": Array.from(this.myPieces) };
        } else {
            return { "player1Pieces": Array.from(this.opponentPieces), "player2Pieces": Array.from(this.myPieces) };
        }
    }
}

// Export the Board class for use in other files.
module.exports = { Board };
