// This file contains all the global configuration and test flags for the game.

// --- Board Dimensions ---
const BoardMax = 400;
const squaresCount = 18;
const sideborder = 2;

// --- Test Mode Flags ---
const TEST_MODE =false;
const TEST_CASE_ID = 1;
const TEST_MODE_ONE_PLAYER_CONTROLS_ALL = true;
const TEST_MODE_REMOVE_DIRECTION_CHECK = true;
const TEST_MODE_ALLOW_ANY_DIRECTION = true;
const TEST_MODE_UNLIMITED_MOVE_DISTANCE = false;

module.exports = {BoardMax, squaresCount, sideborder, TEST_MODE, TEST_CASE_ID, TEST_MODE_ONE_PLAYER_CONTROLS_ALL, TEST_MODE_REMOVE_DIRECTION_CHECK, TEST_MODE_ALLOW_ANY_DIRECTION, TEST_MODE_UNLIMITED_MOVE_DISTANCE };
