import url from 'url';
import base64id from 'base64id';
import { getGame, updateGame, addGameList } from '../services/redis.js';
import { board as Board } from '../services/board.js';
import { BoardMax, squaresCount, sideborder } from '../shared/player.js';

// This main function sets up all the socket event listeners
export default function initializeSockets(io) {

    io.engine.generateId = (req) => {
        const parsedUrl = url.parse(req.url, true);
        const prevId = parsedUrl.query.socketId;
        return (prevId && prevId.length > 0) ? prevId : base64id.generateId();
    };

    io.use((socket, next) => {
        socket.id = socket.conn.id;
        console.log(`🔧 Middleware synced ID to: ${socket.id}`);
        next();
    });

    io.on('connection', (socket) => {
        console.log(`SERVER: 🟢 User connected with socket ID: ${socket.id}`);

        // Handle the game creation or joining from the client
        socket.on("creategame", async (room) => {
            console.log(`SERVER: ➡️ Received 'creategame' event for room: ${room}`);
            await createOrJoinGame(socket, room, io);
        });

        // The rest of your listeners...
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
            console.log(`SERVER: ➡️ Received 'gamestate' event from client.`);
            await interactiveHelper(socket, io);
            if (callback) callback({ response: "ok" });
        });

        socket.on('disconnect', async () => {
            console.log(`SERVER: 🔴 User ${socket.id} disconnected`);
            if (!socket.room) return;
            const remainingSockets = await io.in(socket.room).fetchSockets();
            remainingSockets.forEach(s => s.emit("creategame"));
        });
    });
}

// --- Helper Functions (Game Logic) ---

async function createOrJoinGame(socket, room, io) {
    console.log(`SERVER: Running createOrJoinGame for socket ${socket.id}`);
    
    await addGameList(room);
    socket.room = room;

    const latestGameData = await getGame(room);
    if (!latestGameData) {
        console.error(`SERVER: ❌ Game room ${room} not found.`);
        return;
    }

    let player, playerNumber;
    let updates = {};

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
        console.log(`SERVER: ➡️ Emitted 'full' to client ${socket.id}`);
        return;
    }

    await updateGame(room, updates);
    const finalGameData = await getGame(room);

    socket.join(room);
    socket.userRoom = finalGameData;

    if (playerNumber === 1) {
        socket.board = new Board(finalGameData.player1Pieces, finalGameData.player2Pieces, finalGameData.player1Rings, finalGameData.player2Rings, 1);
    } else {
        socket.board = new Board(finalGameData.player2Pieces, finalGameData.player1Pieces, finalGameData.player2Rings, finalGameData.player1Rings, 2);
    }
    
    // The key change: Emit 'setdata' from here
    console.log(`SERVER: ➡️ Emitting 'setdata' to client ${socket.id}`);
    socket.emit("setdata", player, BoardMax, finalGameData.player1Pieces, finalGameData.player2Pieces, squaresCount, sideborder);
    console.log(`SERVER: ✅ ${player} (${socket.id}) has successfully joined ${room}`);

    // Call interactiveHelper ONCE here to handle initial turn setup
    interactiveHelper(socket, io);
}


function validateMove(socket, io, startdex, endex) {
    if (!socket.board || !socket.userRoom) {
        console.warn(`SERVER: ⚠️ Validation failed for socket ${socket.id}. Board or userRoom not found.`);
        return false;
    }
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

    // Call interactiveHelper here to manage the next turn
    interactiveHelper(socket, io);
}

async function getcurrentPlayer(socket, forced) {
    if (forced) {
        return (await getGame(socket.room)).currentplayer;
    }
    return socket.userRoom ? socket.userRoom.currentplayer : null;
}

async function interactiveHelper(socket, io) {
    console.log(`SERVER: Running interactiveHelper for room: ${socket.room}`);
    const gameData = await getGame(socket.room);
    if (!socket.userRoom || !gameData) {
        console.warn(`SERVER: ⚠️ interactiveHelper failed. Missing socket.userRoom or gameData.`);
        return;
    }

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

    const updatedGameData = await updateGame(socket.room, {
        "currentplayer": nextPlayer,
        "currentid": nextPlayerId
    });
    
    const socketsInRoom = await io.in(socket.room).fetchSockets();
    socketsInRoom.forEach(s => {
        s.userRoom = updatedGameData;
        s.emit("setplayerindicator", updatedGameData.currentplayer);
        if (s.id === updatedGameData.currentid) {
            console.log(`SERVER: ➡️ Emitting 'enableinteractive' to player ${s.id}`);
            s.emit("enableinteractive");
        } else {
            s.emit("disableinteractive");
        }
    });
    console.log(`SERVER: ✅ interactiveHelper finished. Current player is ${nextPlayer}`);
}