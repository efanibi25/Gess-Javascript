import { getPiece, getBlock, getDirection, getNeighborsOfPiece } from './boardUtils.js';

// --- Core Game Logic Functions ---

/**
 * Gets all pieces within a 5x5 'ring' centered on a given piece.
 * The ring includes the central piece, its direct neighbors, and its neighbors' neighbors.
 * @param {Array<object>} board The board array.
 * @param {object} gameData The game data object containing board dimensions.
 * @param {object} centerPiece The central piece object.
 * @returns {Array<object>} An array of unique piece objects in the ring.
 */
export function getRingNeighborsOfPiece(board, gameData, centerPiece) {
    if (!centerPiece) return [];

    const allRingPieces = new Set();
    const centralBlock = centerPiece.block;
    const gridSize = gameData.squaresCount + gameData.sideborder;

    // Iterate through a 5x5 grid around the central block
    for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
            const indexOffset = r * gridSize + c;
            const piece = getPiece(board, centralBlock.index + indexOffset);
            if (piece) {
                allRingPieces.add(piece);
            }
        }
    }

    return Array.from(allRingPieces);
}

/**
 * Swaps a 3x3 grid of pieces from a start position to a target position.
 * This is the core logic for moving a Gess piece.
 * @param {Array<object>} board The board array.
 * @param {string} playerColor The color of the current player.
 * @param {object} startPiece The central piece of the starting 3x3 grid.
 * @param {object} targetPiece The central piece of the target 3x3 grid.
 * @param {object} phaserDisplay The Phaser Display utility.
 * @returns {void}
 */
export function swapPieces(board, playerColor, startPiece, targetPiece, phaserDisplay) {
    if (!startPiece || !targetPiece) return;

    const gameData = startPiece.block.gessBoard.gameData;
    const startNeighbors = getNeighborsOfPiece(board, gameData, startPiece);
    const targetNeighbors = getNeighborsOfPiece(board, gameData, targetPiece);

    const colorCache = {};

    // 1. Store the ownership of the pieces in the starting grid
    for (const key in startNeighbors) {
        const piece = startNeighbors[key];
        if (piece) {
            colorCache[key] = piece.owner;
        }
    }

    // 2. Clear the original pieces and reset their positions
    for (const key in startNeighbors) {
        const piece = startNeighbors[key];
        if (piece) {
            piece.updateOwner(null);
            phaserDisplay.Align.In.Center(piece, piece.block);
        }
    }

    // 3. Apply the stored ownership to the target grid
    for (const key in targetNeighbors) {
        const piece = targetNeighbors[key];
        const newOwner = colorCache[key];
        if (piece && newOwner) {
            // Do not overwrite a piece with the same color
            if (piece.owner !== playerColor) {
                piece.updateOwner(newOwner);
            }
        }
    }
}

/**
 * Moves a piece by swapping its 3x3 grid to a new location.
 * @param {Array<object>} board The board array.
 * @param {string} playerColor The color of the current player.
 * @param {object} scene The Phaser scene.
 * @param {object} gameData The game data object.
 * @param {object} phaserDisplay The Phaser Display utility.
 * @param {number} startIndex The index of the starting block.
 * @param {number} targetIndex The index of the target block.
 * @returns {void}
 */
export function movePiece(board, playerColor, scene, gameData, phaserDisplay, startIndex, targetIndex) {
    const startBlock = getBlock(board, startIndex);
    const targetBlock = getBlock(board, targetIndex);

    if (!startBlock || !targetBlock) return;

    const direction = getDirection(startBlock, targetBlock, gameData);
    if (direction !== undefined) {
        const startPiece = getPiece(board, startIndex);
        const targetPiece = getPiece(board, targetIndex);
        swapPieces(board, playerColor, startPiece, targetPiece, phaserDisplay);
    }
    
    scene.events.emit('updatePiece');
}