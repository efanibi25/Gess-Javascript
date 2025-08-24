import { data } from "../../scripts/lib/network.js";

export function getOtherPlayerPieces(player) {
    if (player === "player1") {
        return data["PLAYER2_PIECES"];
    } else {
        return data["PLAYER1_PIECES"];
    }
}

export function getMyPieces(player) {
    if (player === "player1") {
        return data["PLAYER1_PIECES"];
    } else {
        return data["PLAYER2_PIECES"];
    }
}

