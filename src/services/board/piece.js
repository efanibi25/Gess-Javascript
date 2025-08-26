// This file contains the Piece class, which represents a single game piece.

// Import the necessary constants from the shared config file.
import { squaresCount, sideborder } from "../../shared/config.js";

export class Piece {
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
}