import { data } from "../../scripts/lib/network.js";

// --- Piece and Board Accessors ---

/**
 * Checks if a piece is in a draggable area on the board.
 * Pieces in the border area are not draggable.
 * @param {object} piece The piece object to check.
 * @returns {boolean} True if the piece is in a draggable area, false otherwise.
 */
export function isPieceDraggable(piece) {
    if (!piece || !piece.block) return false;

    const { row, col } = piece.block;
    const { sideborder, squaresCount } = data;
    const halfBorder = sideborder / 2;

    const isInsideDraggableArea = (
        row > halfBorder + 1 &&
        col > halfBorder + 1 &&
        col < squaresCount + halfBorder &&
        row < squaresCount + halfBorder
    );

    return isInsideDraggableArea;
}

/**
 * Finds all the pieces that the current player can drag.
 * @param {Array<object>} board The board array of block objects.
 * @param {string} playerColor The color of the current player ('white' or 'black').
 * @returns {Array<object>} An array of draggable piece objects.
 */
export function getDraggablePieces(board, playerColor) {
    return board
        .map(block => block.piece)
        .filter(piece =>
            piece &&
            piece.gamePiece &&
            piece.owner === playerColor &&
            isPieceDraggable(piece)
        );
}

/**
 * Retrieves a block from the board by its 1-based index.
 * @param {Array<object>} board The board array.
 * @param {number} index The 1-based index of the block.
 * @returns {object | null} The block object or null if the index is out of bounds.
 */
export function getBlock(board, index) {
    if (index < 0 || index >= data.BoardMax) {
        return null;
    }
    return board[index - 1];
}

/**
 * Retrieves a piece from the board by its block index.
 * @param {Array<object>} board The board array.
 * @param {number} index The 1-based index of the block.
 * @returns {object | null} The piece object or null if the block doesn't exist.
 */
export function getPiece(board, index) {
    const block = getBlock(board, index);
    return block ? block.piece : null;
}

// --- Movement and Neighbor Functions ---

/**
 * Calculates the direction of a move between two blocks.
 * @param {object} startBlock The starting block.
 * @param {object} endBlock The ending block.
 * @param {object} gameData The game data object.
 * @returns {number | undefined} The numerical direction offset, or undefined if the move is not linear.
 */
export function getDirection(startBlock, endBlock, gameData) {
    const rowChange = endBlock.row - startBlock.row;
    const colChange = endBlock.col - startBlock.col;
    const gridSize = gameData.squaresCount + gameData.sideborder;

    if (colChange === 0 && rowChange === 0) return 0;
    if (colChange === 0) return rowChange > 0 ? gridSize : -gridSize;
    if (rowChange === 0) return colChange > 0 ? 1 : -1;
    if (Math.abs(rowChange) !== Math.abs(colChange)) return undefined;

    if (rowChange < 0 && colChange < 0) return -gridSize - 1;
    if (rowChange < 0 && colChange > 0) return -gridSize + 1;
    if (rowChange > 0 && colChange < 0) return gridSize - 1;
    if (rowChange > 0 && colChange > 0) return gridSize + 1;
}

/**
 * Gets the 9 blocks (including the center) that surround a given block.
 * @param {Array<object>} board The board array.
 * @param {number} blockIndex The 1-based index of the central block.
 * @returns {object} An object containing the neighbor blocks, keyed by their offset from the center.
 */
export function getNeighborsOfBlock(board, blockIndex) {
    // These offsets are not dynamically calculated.
    const neighborsDexes = [
        0, -1, 1,
        -data.squaresCount - data.sideborder,
        data.squaresCount + data.sideborder,
        -data.squaresCount - data.sideborder + 1,
        -data.squaresCount - data.sideborder - 1,
        data.squaresCount + data.sideborder - 1,
        data.squaresCount + data.sideborder + 1
    ];

    const neighbors = {};
    for (const offset of neighborsDexes) {
        neighbors[offset] = getBlock(board, blockIndex + offset);
    }
    return neighbors;
}

/**
 * Gets the 9 pieces (including the center) that surround a given piece.
 * @param {Array<object>} board The board array.
 * @param {object} gameData The game data object.
 * @param {object} piece The central piece.
 * @returns {object} An object containing the neighbor pieces, keyed by their offset from the center.
 */
export function getNeighborsOfPiece(board, gameData, piece) {
    // These offsets are dynamically calculated.
    const neighborOffsets = [
        -gameData.squaresCount - gameData.sideborder - 1,
        -gameData.squaresCount - gameData.sideborder,
        -gameData.squaresCount - gameData.sideborder + 1,
        -1,
        0,
        1,
        gameData.squaresCount + gameData.sideborder - 1,
        gameData.squaresCount + gameData.sideborder,
        gameData.squaresCount + gameData.sideborder + 1,
    ];

    const out = {};
    for (const offset of neighborOffsets) {
        out[offset] = getPiece(board, piece.index + offset);
    }
    return out;
}