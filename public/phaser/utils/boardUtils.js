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