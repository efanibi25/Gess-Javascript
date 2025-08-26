// Import the necessary constants from the shared config file.
import { squaresCount, sideborder } from "../../shared/config.js";

export class Block {
    /**
     * Represents a single block (square) on the game board.
     * @param {number} index - The 0-based index of the block.
     * @param {number} row - The 0-based row coordinate.
     * @param {number} col - The 0-based column coordinate.
     * @param {object} board - A reference to the parent board.
     */
    constructor(index, row, col, board) {
        // Convert from 0-based to 1-based indexing for game logic
        this.index = index + 1;
        this.row = row + 1;
        this.col = col + 1;
        this.board = board;
        this.piece = null;
    }

    /**
     * Checks if this block is part of the main game area (not the border).
     * If not, it sets the piece to `false` to indicate an invalid block.
     * @returns {boolean} True if the block is a game piece block, false otherwise.
     */
    isGameBlock() {
        const halfBorder = sideborder / 2;

        const isInGrid = (
            this.row > halfBorder &&
            this.col > halfBorder &&
            this.row <= squaresCount + halfBorder &&
            this.col <= squaresCount + halfBorder
        );

        if (this.piece === false) {
            return false;
        }

        if (!isInGrid) {
            this.piece = false;
        }

        return this.piece !== false;
    }
}