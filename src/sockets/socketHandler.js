import url from 'url';
import base64id from 'base64id';
import { getGame, updateGame, addGameList } from '../services/redis.js';
import { board as Board } from '../services/board.js';
import { BoardMax, squaresCount, sideborder } from '../shared/player.js';

// This main function sets up all the socket event listeners
export default function initializeSockets(io) {

    // Tell the server how to generate or accept a socket ID.
    io.engine.generateId = (req) => {
        const parsedUrl = url.parse(req.url, true);
        const prevId = parsedUrl.query.socketId;

        // If the client provided a socketId from localStorage, use it.
        if (prevId && prevId.length > 0) {
            return prevId;
        }

        // Otherwise, generate a new, random ID.
        return base64id.generateId();
    };
    io.use((socket, next) => {
        // The correct, persistent ID lives on the underlying connection object
        socket.id = socket.conn.id;
        console.log(`🔧 Middleware synced ID to: ${socket.id}`);
        next();
    });

    io.on('connection', (socket) => {
        console.log(`A user connected with socket ID: ${socket.id}`);

        socket.on("creategame", async (room, callback) => {
            console.log(`joining game ${room}`);
            await game(socket, room);
            await join(socket, room, io);
            if (callback) callback({ response: "ok" });
        });

        socket.on("sendmove", async (startdex, endex, callback) => {
            if (validateMove(socket, io, startdex, endex)) {
                await processMove(socket, io, startdex, endex);
            }
            if (callback) callback({ response: "ok" });
        });

        socket.on("getcurrentplayer", async (forced, callback) => {
            const player = await getcurrentPlayer(socket, forced);
            if (callback) callback({ response: player });
        });

        socket.on("gamestate", async (callback) => {
            await interactiveHelper(socket, io);
            if (callback) callback({ response: "ok" });
        });

        socket.on('disconnect', async () => {
            console.log(`User ${socket.id} disconnected`);
            if (!socket.room) return;
            const remainingSockets = await io.in(socket.room).fetchSockets();
            remainingSockets.forEach(s => s.emit("creategame"));
        });
    });
}

// --- Helper Functions (Game Logic) ---

async function game(socket, room) {
    await addGameList(room);
    socket.room = room;
    socket.userRoom = await getGame(room);
}

async function join(socket, room, io) {
    // 1. Fetch the MOST RECENT game state from the database first.
    const latestGameData = await getGame(room);
    if (!latestGameData) {
        console.error(`Game room ${room} not found.`);
        return;
    }

    let player, playerNumber;
    let updates = {};

    // 2. Decide the player's role based on this fresh data.
    if (latestGameData.player1 === socket.id || !latestGameData.player1) {
        player = "player1";
        playerNumber = 1;
        updates.player1 = socket.id;
    } else if (latestGameData.player2 === socket.id || !latestGameData.player2) {
        player = "player2";
        playerNumber = 2;
        updates.player2 = socket.id;
    } else {
        socket.emit("full");
        return;
    }

    // 3. Perform a SINGLE update to the database with the new player ID.
    await updateGame(room, updates);

    // 4. Fetch the final, updated game state to ensure consistency.
    const finalGameData = await getGame(room);

    // 5. Create the board and emit data based on this definitive state.
    socket.join(room);
    socket.userRoom = finalGameData; // Update the socket's state with the definitive data

    if (playerNumber === 1) {
        socket.board = new Board(finalGameData.player1Pieces, finalGameData.player2Pieces, finalGameData.player1Rings, finalGameData.player2Rings, 1);
    } else {
        socket.board = new Board(finalGameData.player2Pieces, finalGameData.player1Pieces, finalGameData.player2Rings, finalGameData.player1Rings, 2);
    }

    socket.emit("setdata", player, BoardMax, finalGameData.player1Pieces, finalGameData.player2Pieces, squaresCount, sideborder);
    console.log(`${player} (${socket.id}) has successfully joined ${room}`);
}


function validateMove(socket, io, startdex, endex) {
    if (!socket.board || !socket.userRoom) return false;
    if (socket.id !== socket.userRoom.currentid) {
        io.to(socket.id).emit("sendalert", "You are not the current player");
        return false;
    }
    if (!socket.board.validatePiece(startdex)) {
        io.to(socket.id).emit("sendmove", startdex, startdex, false);
        io.to(socket.id).emit("sendalert", "The Piece is not valid");
        return false;
    }
    if (!socket.board.validateMove(startdex, endex)) {
        io.to(socket.id).emit("sendmove", startdex, startdex, false);
        io.to(socket.id).emit("sendalert", "The given move is not valid");
        io.to(socket.id).emit("enableinteractive");
        return false;
    }
    return true;
}

async function processMove(socket, io, startdex, endex) {
    const gameData = await getGame(socket.room);
    endex = socket.board.getMaxMovement(startdex, endex);
    const update = {
        ...{ "moves": gameData.moves + 1, "currentplayer": null, "currentid": null },
        ...socket.board.updateBoard(startdex, endex)
    };
    socket.userRoom = await updateGame(socket.room, update);
    if (socket.userRoom.winner) {
        io.to(socket.room).emit("winner", socket.userRoom.winner);
    } else {
        io.to(socket.room).emit("sendmove", startdex, endex);
    }
}

async function getcurrentPlayer(socket, forced) {
    if (forced) {
        return (await getGame(socket.room)).currentplayer;
    }
    return socket.userRoom ? socket.userRoom.currentplayer : null;
}

async function interactiveHelper(socket, io) {
    const gameData = await getGame(socket.room);
    if (!socket.userRoom || !gameData) return;

    if (gameData.winner) {
        io.to(socket.room).emit("winner", gameData.winner);
        return;
    }

    let nextPlayer, nextPlayerId;
    if (gameData.moves % 2 === 0) {
        nextPlayer = "player1";
        nextPlayerId = gameData.player1;
    } else {
        nextPlayer = "player2";
        nextPlayerId = gameData.player2;
    }

    socket.userRoom = await updateGame(socket.room, {
        "currentplayer": nextPlayer,
        "currentid": nextPlayerId
    });

    const socketsInRoom = await io.in(socket.room).fetchSockets();
    socketsInRoom.forEach(s => {
        s.emit("setplayerindicator", socket.userRoom.currentplayer);
        if (s.id === socket.userRoom.currentid) {
            s.emit("enableinteractive");
        } else {
            s.emit("disableinteractive");
        }
    });
}