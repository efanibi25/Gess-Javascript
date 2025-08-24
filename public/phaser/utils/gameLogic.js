import { getPiece, getBlock, getDirection } from './boardUtils.js';

export function getNeighborsOfPiece(board, gameData, piece) {
    const out = {};
    const neighborsDexes = [
    -gameData.squaresCount - gameData.sideborder - 1,  // Top-left
    -gameData.squaresCount - gameData.sideborder,      // Top
    -gameData.squaresCount - gameData.sideborder + 1,  // Top-right
    -1,                                                // Left
    0,                                                 // Center
    1,                                                 // Right
    gameData.squaresCount + gameData.sideborder - 1,   // Bottom-left
    gameData.squaresCount + gameData.sideborder,       // Bottom
    gameData.squaresCount + gameData.sideborder + 1,   // Bottom-right
];

    for (const offset of neighborsDexes) {
        out[offset] = getPiece(board, piece.index + offset);
    }
    return out;
}

export function getRingNeighborsOfPiece(board, gameData, centerPiece) {
    if (!centerPiece) return [];

    const directNeighbors = Object.values(getNeighborsOfPiece(board, gameData, centerPiece));
    const allRingPieces = new Set([centerPiece, ...directNeighbors]);

    directNeighbors.forEach(neighbor => {
        if (neighbor) {
            const neighborsOfNeighbor = Object.values(getNeighborsOfPiece(board, gameData, neighbor));
            neighborsOfNeighbor.forEach(p => {
                if (p) allRingPieces.add(p);
            });
        }
    });

    return Array.from(allRingPieces);
}

export function swapPieces(board,playerColor, startPiece, targetPiece, phaserDisplay) {
    if (!startPiece || !targetPiece) return;



        const startNeighbors = getNeighborsOfPiece(board, startPiece.block.gessBoard.gameData, startPiece)
        const targetNeighbors = getNeighborsOfPiece(board, targetPiece.block.gessBoard.gameData, targetPiece);
        
        const colorCache = {};

        // Store the owner of each piece in the starting 3x3 grid
        for (const key in startNeighbors) {
            const piece = startNeighbors[key];
            if (piece) {
                colorCache[key] = piece.owner;
                piece.updateOwner(null); // Clear the original position
                phaserDisplay.Align.In.Center(piece, piece.block);
            }
        }
        
        // Apply the stored owners to the new, target 3x3 grid
        for (const key in targetNeighbors) {
            const piece = targetNeighbors[key];
            if (piece && colorCache[key]) {
                // Don't overwrite a piece with the same color
                if (piece.owner !== playerColor) {
                    piece.updateOwner(colorCache[key]);
                }
            }
        }









}

export function movePiece(board,playerColor,scene,gameData,phaserDisplay,startIndex, targetIndex, ) {
    const startBlock = getBlock(board, startIndex);
    const targetBlock = getBlock(board, targetIndex);

    if (!startBlock || !targetBlock) return;
    const direction = getDirection(startBlock, targetBlock, gameData);
    if (direction === 0) {
        swapPieces(board,playerColor, getPiece(board, startIndex), getPiece(board, startIndex),phaserDisplay);
    } else if (direction !== undefined) {
        swapPieces(board,playerColor, getPiece(board, startIndex), getPiece(board, targetIndex),phaserDisplay);
    }
    scene.events.emit('updatePiece');
}






