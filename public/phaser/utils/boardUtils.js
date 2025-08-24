import { data } from "../../scripts/lib/network.js";

// This function checks if a piece is in a draggable area
export function isPieceDraggable(piece) {
    if (!piece || !piece.block) return false;

    const { row, col } = piece.block;
    const { sideborder, squaresCount } = data; // Note: Use 'data' directly
    const halfBorder = sideborder / 2;

    const isInsideDraggableArea = (
        row > halfBorder + 1 &&
        col > halfBorder + 1 &&
        col < squaresCount + halfBorder &&
        row < squaresCount + halfBorder
    );

    return isInsideDraggableArea;
}

// This function finds all the pieces that the current player can drag
export function getDraggablePieces(board, playerColor) {
    return board
        .map(block => block.piece)
        .filter(piece => 
            piece && 
            piece.gamePiece && 
            piece.owner === playerColor && 
            isPieceDraggable(piece) // Calls the other utility function
        );
}

export function getBlock(board, index) {
    if (index < 0 || index >= data["BoardMax"]) {
        return null;
    }
    return board[index - 1];
}





export function getPiece(board, index) {
    const block = getBlock(board, index);
    if (block) {
        return block.piece;
    }
    return null; // Return null if the block doesn't exist
}


export function getDirection(startBlock, endBlock, gameData) {
    const rowChange = endBlock.row - startBlock.row;
    const colChange = endBlock.col - startBlock.col;
    const gridSize = gameData.squaresCount + gameData.sideborder;

    if (colChange === 0 && rowChange === 0) return 0;
    if (colChange === 0 && rowChange >= 1) return gridSize;
    if (colChange === 0 && rowChange < 0) return -gridSize;
    if (rowChange === 0 && colChange >= 1) return 1;
    if (rowChange === 0 && colChange < 0) return -1;
    if (Math.abs(rowChange) !== Math.abs(colChange)) return undefined;
    if (rowChange < 0 && colChange < 0) return -gridSize - 1;
    if (rowChange < 0 && colChange > 0) return -gridSize + 1;
    if (rowChange > 0 && colChange < 0) return gridSize - 1;
    if (rowChange > 0 && colChange > 0) return gridSize + 1;
}