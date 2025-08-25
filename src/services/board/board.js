// board.js
// This file contains the main Board class, which manages the game state.

// Require the Block and Piece classes from their respective files.
const { BoardMax, squaresCount, sideborder } = require("../../shared/player.js");
const { Block } = require("./block.js");
const { Piece } = require("./piece.js");

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
        this.number = number;
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
        let excluded_indexes = new Set(Object.values(startpiece.neighbors).map(e => e.index));
        startpiece.getNeighbors();
        for (let current of positions) {
            for (let key of Object.keys(startpiece.neighbors)) {
                if (startpiece.neighbors[key].owner == null) continue;
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
        if (rings.size == 0 && this.number == 1) return { "player1Rings": [], "winner": "Player2" };
        else if (this.number == 1) return { "player1Rings": Array.from(rings) };
        else if (rings.size == 0 && this.number == 2) return { "player2Rings": [], "winner": "Player1" };
        else if (this.number == 2) return { "player2Rings": Array.from(rings) };
    }

    checkWin(index) {
        let rings = this.updateOpponentRings(index);
        if (rings.size == 0 && this.number == 1) return { "player2Rings": [], "winner": "Player1" };
        else if (this.number == 1) return { "player2Rings": Array.from(rings) };
        else if (rings.size == 0 && this.number == 2) return { "player1Rings": [], "winner": "Player2" };
        else if (this.number == 2) return { "player1Rings": Array.from(rings) };
    }

    updateRings(index) {
        let potentialRings = [...Array.from(this.rings), ...this.getRingNeighbors(index)];
        this.rings = new Set(potentialRings.map(e => this.getPiece(e)).filter(e => e != null && e != false && e.checkRing() == true).map(e => e.index));
        return this.rings;
    }

    updateOpponentRings(index) {
        let potentialRings = [...Array.from(this.opponentRings), ...this.getRingNeighbors(index)];
        this.opponentRings = new Set(potentialRings.map(e => this.getPiece(e)).filter(e => e != null && e != false && e.checkRing(true) == true).map(e => e.index));
        return this.opponentRings;
    }

    getRingNeighbors(index) {
        let piece = this.getPiece(index);
        piece.getNeighbors();
        return Object.keys(piece.neighbors).filter(ele => ele != 0).reduce((accumulator, currentValue) => {
            accumulator.push(piece.neighbors[currentValue].index);
            piece.neighbors[currentValue].getNeighbors();
            return accumulator;
        }, [piece.index]);
    }
    
    // --- Validation ---
    
    validatePiece(start) {
        let startblock = this.getBlock(start);
        if (this.testValidBlock(startblock) == false) {
            return false;
        }
        return true;
    }

    testValidBlock(startblock) {
        if (!startblock.piece) {
            return false;
        }
        startblock.piece.getNeighbors();
        if (Object.values(startblock.piece.neighbors).filter(ele => ele.owner == "opponent").length > 0) {
            console.log("can't move opponent pieces");
            return false;
        } else if (Object.values(startblock.piece.neighbors).filter(ele => ele.piece == false).length > 0) {
            console.log("block Must Have 9 game blocks");
            return false;
        } else if (Object.values(startblock.piece.neighbors).filter(ele => ele.piece != false).length == 0) {
            console.log("Can't Move Block With No Pieces");
            return false;
        }
        return true;
    }

    validateMove(start, end) {
        let dir = this.getDir(start, end);
        let startblock = this.getBlock(start);
        if (dir == 0) {
            console.log("You must Move at least 1 block");
            return false;
        } else if (dir == null) {
            console.log("invalid movemeent");
            return false;
        } else if (startblock.piece.neighbors[dir].owner == null) {
            console.log("The Given Direction does not have a piece");
            return false;
        } else if (startblock.piece.neighbors[dir].owner == "opponent") {
            console.log("The Given Direction has the opponent piece");
            return false;
        } else if (startblock.piece.neighbors[dir].owner == null && Math.abs((start - end) / dir) > 3) {
            return false;
        }
        return true;
    }

    // --- Board Update Logic ---

    updateBoard(start, end) {
        let set = this.updateSets(start, end);
        this.updatePieces(start, end);
        let lost = this.checkLose(end);
        let win = this.checkWin(end);
        return { ...lost, ...win, ...set };
    }

    updatePieces(start, end) {
        let startblock = this.getBlock(start);
        let endblock = this.getBlock(end);
        let colordict = {};
        for (const key of Object.keys(startblock.piece.getNeighbors())) {
            colordict[key] = startblock.piece.neighbors[key].owner;
        }
        for (const val of Object.values(startblock.piece.getNeighbors())) {
            val.owner = null;
        }
        for (const val of Object.values(endblock.piece.getNeighbors()).filter(e => e.owner == "opponent")) {
            val.owner = null;
        }
        Object.keys(colordict).filter(key => colordict[key] != null).forEach(key => {
            let piece = this.getPiece(end + parseInt(key));
            if (piece) piece.owner = colordict[key];
        });
    }

    updateSets(start, end) {
        let startblock = this.getBlock(start);
        let endblock = this.getBlock(end);
        startblock.piece.getNeighbors();
        endblock.piece.getNeighbors();
        let colordict = {};
        for (const key of Object.keys(startblock.piece.neighbors)) {
            colordict[key] = startblock.piece.neighbors[key].owner;
        }
        for (const val of Object.values(startblock.piece.neighbors)) {
            this.myPieces.delete(val.index);
        }
        for (const val of Object.values(endblock.piece.neighbors).filter(e => e.owner == "opponent")) {
            this.opponentPieces.delete(val.index);
        }
        for (const key of Object.keys(colordict)) {
            if (colordict[key] == "mine") {
                this.myPieces.add(endblock.piece.neighbors[key].index);
            }
        }
        if (this.number == 1) {
            return { "player2Pieces": Array.from(this.opponentPieces), "player1Pieces": Array.from(this.myPieces) };
        } else {
            return { "player1Pieces": Array.from(this.opponentPieces), "player2Pieces": Array.from(this.myPieces) };
        }
    }
}

// Export the Board class for use in other files.
module.exports = { Board };