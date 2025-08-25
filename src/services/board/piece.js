// piece.js
// This file contains the Piece class, which represents a single game piece.

// Require the necessary constants from the shared player file.
const { squaresCount, sideborder } = require("../../shared/player.js");

class Piece {
    /**
     * Represents a single game piece on the board.
     * @param {number} index - The 1-based index of the piece's block.
     * @param {number} row - The 0-based row coordinate.
     * @param {number} col - The 0-based column coordinate.
     * @param {object} board - A reference to the parent board.
     */
    constructor(index, row, col, board) {
        this.index = index;
        this.row = row + 1;
        this.col = col + 1;
        this.board = board;
        this.owner = null;
        
        // Offsets for the 8 neighbors and the center piece.
        this.neighborsDexes = [
            -squaresCount - sideborder - 1,
            -squaresCount - sideborder,
            -squaresCount - sideborder + 1,
            -1,
            0,
            1,
            squaresCount + sideborder - 1,
            squaresCount + sideborder,
            squaresCount + sideborder + 1
        ];

        this.neighbors = null;
    }

    /**
     * Retrieves the 9 pieces (including the center) in the 3x3 grid around this piece.
     * @returns {object} An object containing the neighbor pieces, keyed by their offset.
     */
    getNeighbors() {
        const neighbors = {};
        for (const offset of this.neighborsDexes) {
            const piece = this.board.getPiece(this.index + offset);
            neighbors[offset] = piece;
        }

        this.neighbors = neighbors;
        return neighbors;
    }

    /**
     * Checks if this piece is the center of a "ring".
     * A ring is a 3x3 square of pieces with a hole in the center.
     * @param {boolean} [isOpponent=false] - True to check for an opponent's ring.
     * @returns {boolean} True if a ring is formed, false otherwise.
     */
    checkRing(isOpponent = false) {
        // A piece cannot be the center of a ring if it has an owner.
        if (this.owner !== null) {
            return false;
        }

        this.getNeighbors();
        const requiredOwner = isOpponent ? "opponent" : "mine";
        
        const filledNeighborsCount = Object.values(this.neighbors).filter(
            ele => ele !== null && ele.index !== this.index && ele.owner === requiredOwner
        ).length;

        return filledNeighborsCount === 8;
    }
}

// Export the Piece class for use in other files.
module.exports = { Piece };