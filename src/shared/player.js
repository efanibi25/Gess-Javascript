// --- Data Variables ---
// We must declare these with `let` or `const` to export them later.
let PLAYER1_PIECES, PLAYER2_PIECES, PLAYER1_RINGS, PLAYER2_RINGS;

const DEFAULT_PLAYER1_PIECES = new Set([23, 25, 27, 28, 29, 30, 31, 32, 33, 34, 36, 38, 42, 43, 44, 46, 48, 49, 50, 51, 53, 55, 57, 58, 59, 63, 65, 67, 68, 69, 70, 71, 72, 73, 74, 76, 78, 120, 123, 126, 129, 132, 135, 138])
const DEFAULT_PLAYER2_PIECES = new Set([260, 263, 266, 269, 272, 275, 278, 323, 325, 327, 328, 329, 330, 331, 332, 333, 334, 336, 338, 342, 343, 344, 346, 348, 349, 350, 351, 353, 355, 357, 358, 359, 363, 365, 367, 368, 369, 370, 371, 372, 373, 374, 376, 378, 380])
const DEFAULT_PLAYER1_RINGS = new Set([52])
const DEFAULT_PLAYER2_RINGS = new Set([352])

// --- Logic to Select Data Set ---
// You will need to import TEST_MODE and TEST_CASE_ID as ES modules
import { TEST_MODE, TEST_CASE_ID } from "./config.js";

if (TEST_MODE) {
    console.log(`⚠️ Shared player data is in TEST MODE (Case ID: ${TEST_CASE_ID})`);
    switch (TEST_CASE_ID) {
        case 1:
            PLAYER1_PIECES = new Set([64, 65, 66, 84, 86, 104, 105, 106]);
            PLAYER2_PIECES = new Set([200]);
            PLAYER1_RINGS = new Set([85]);
            PLAYER2_RINGS = new Set([]);
            break;
        case 2:
            PLAYER1_PIECES = new Set([84, 85, 86]);
            PLAYER2_PIECES = new Set([104, 105, 106, 124, 126, 144, 145, 146]);
            PLAYER1_RINGS = new Set([]);
            PLAYER2_RINGS = new Set([125]);
            break;
        case 3:
            PLAYER1_PIECES = new Set([84, 85, 86]);
            PLAYER2_PIECES = new Set([64, 65, 66, 84, 86, 104, 105, 106]);
            PLAYER1_RINGS = new Set([]);
            PLAYER2_RINGS = new Set([85]);
            break;
        default:
            PLAYER1_PIECES = DEFAULT_PLAYER1_PIECES;
            PLAYER2_PIECES = DEFAULT_PLAYER2_PIECES;
            PLAYER1_RINGS = DEFAULT_PLAYER1_RINGS;
            PLAYER2_RINGS = DEFAULT_PLAYER2_RINGS;
            break;
    }
} else {
    // Standard Game (Default)
    PLAYER1_PIECES = DEFAULT_PLAYER1_PIECES;
    PLAYER2_PIECES = DEFAULT_PLAYER2_PIECES;
    PLAYER1_RINGS = DEFAULT_PLAYER1_RINGS;
    PLAYER2_RINGS = DEFAULT_PLAYER2_RINGS;
}

// Export the variables using ES module syntax
export { PLAYER1_PIECES, PLAYER2_PIECES, PLAYER1_RINGS, PLAYER2_RINGS };