
const {TEST_MODE, TEST_CASE_ID }=require("./config.js")
// --- Data Variables ---
let PLAYER1_PIECES, PLAYER2_PIECES, PLAYER1_RINGS, PLAYER2_RINGS;


const DEFAULT_PLAYER1_PIECES = new Set([23, 25, 27, 28, 29, 30, 31, 32, 33, 34, 36, 38, 42, 43, 44, 46, 48, 49, 50, 51, 53, 55, 57, 58, 59, 63, 65, 67, 68, 69, 70, 71, 72, 73, 74, 76, 78, 120, 123, 126, 129, 132, 135, 138])
const DEFAULT_PLAYER2_PIECES = new Set([260, 263, 266, 269, 272, 275, 278, 323, 325, 327, 328, 329, 330, 331, 332, 333, 334, 336, 338, 342, 343, 344, 346, 348, 349, 350, 351, 353, 355, 357, 358, 359, 363, 365, 367, 368, 369, 370, 371, 372, 373, 374, 376, 378, 380])
const DEFAULT_PLAYER1_RINGS=new Set([52])
const DEFAULT_PLAYER2_RINGS=new Set([352])


// --- Logic to Select Data Set ---
if (TEST_MODE) {
    console.log(`⚠️ Shared player data is in TEST MODE (Case ID: ${TEST_CASE_ID})`);
    switch (TEST_CASE_ID) {
        case 1: // Lose Condition: Player 1 has one ring at index 85 and moves it.
            PLAYER1_PIECES = new Set([64, 65, 66, 84, 86, 104, 105, 106]);
            PLAYER2_PIECES = new Set([200]); // Opponent piece out of the way
            PLAYER1_RINGS = new Set([85]);
            PLAYER2_RINGS = new Set([]);
            break;
        case 2: // Win Condition: Player 1 moves into Player 2's last ring at index 125.
            PLAYER1_PIECES = new Set([84, 85, 86]);
            PLAYER2_PIECES = new Set([104, 105, 106, 124, 126, 144, 145, 146]);
            PLAYER1_RINGS = new Set([]);
            PLAYER2_RINGS = new Set([125]);
            break;
        case 3: // Mix Ring Condition: Player 1's pieces are inside Player 2's ring at index 85.
            PLAYER1_PIECES = new Set([84, 85, 86]); // P1 pieces inside
            PLAYER2_PIECES = new Set([64, 65, 66, 84, 86, 104, 105, 106]); // P2 forms a ring
            PLAYER1_RINGS = new Set([]);
            PLAYER2_RINGS = new Set([85]);
            break;
        default: // Case 0 or any other number: Standard Game
            // Standard Gess starting positions
            PLAYER1_PIECES = DEFAULT_PLAYER1_PIECES
            PLAYER2_PIECES = DEFAULT_PLAYER2_PIECES
            PLAYER1_RINGS = DEFAULT_PLAYER1_RINGS
            PLAYER2_RINGS = DEFAULT_PLAYER2_RINGS
            break;
    }
} else {
    // Standard Game (Default)
             PLAYER1_PIECES = DEFAULT_PLAYER1_PIECES
            PLAYER2_PIECES = DEFAULT_PLAYER2_PIECES
            PLAYER1_RINGS = DEFAULT_PLAYER1_RINGS
            PLAYER2_RINGS = DEFAULT_PLAYER2_RINGS
}

module.exports = {PLAYER1_PIECES, PLAYER2_PIECES, PLAYER1_RINGS, PLAYER2_RINGS };