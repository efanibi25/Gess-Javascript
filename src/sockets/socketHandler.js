import url from 'url';
import base64id from 'base64id';
import { getGame, updateGame, addGameList } from '../services/redis.js';
import { BoardMax, squaresCount, sideborder , TEST_MODE_ONE_PLAYER_CONTROLS_ALL} from '../shared/config.js';
import { Board } from "../services/board/board.js"
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

     socket.on("creategame", async (room) => {
        await createOrJoinGame(socket, room, io);
        // Call the new helper function after a player joins
        await updatePlayerStatus(io, socket.room);
    });


        socket.on("sendmove", async (startdex, endex) => {
            if (validateMove(socket, io, startdex, endex)) {
                await processMove(socket, io, startdex, endex);
            }
        });

        socket.on("getcurrentplayer", async (forced, callback) => {
            const player = await getcurrentPlayer(socket, forced);
            if (callback) callback({ response: player });
        });

        socket.on("gamestate", async () => {
            console.log(`SERVER: ➡️ Received 'gamestate' from client ${socket.id}. Checking turns.`);
            await interactiveHelper(socket, io);
        });

       socket.on('disconnect', async () => {
        console.log(`SERVER: 🔴 User ${socket.id} disconnected`);
        if (socket.room) {
            // Call the new helper function after a player disconnects
            await updatePlayerStatus(io, socket.room);
            const remainingSockets = await io.in(socket.room).fetchSockets();
            remainingSockets.forEach(s => s.emit("creategame"));
        }
    });

        



    });
}

// --- Helper Functions ---

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
        return;
    }

    await updateGame(room, updates);
    const finalGameData = await getGame(room);

    await socket.join(room);
    socket.userRoom = finalGameData;

    if (playerNumber === 1) {
        socket.board = new Board(finalGameData.player1Pieces, finalGameData.player2Pieces, finalGameData.player1Rings, finalGameData.player2Rings, 1);
    } else {
        socket.board = new Board(finalGameData.player2Pieces, finalGameData.player1Pieces, finalGameData.player2Rings, finalGameData.player1Rings, 2);
    }
    
    socket.emit("setdata", player, BoardMax, finalGameData.player1Pieces, finalGameData.player2Pieces, squaresCount, sideborder);
    console.log(`SERVER: ✅ ${player} (${socket.id}) has successfully joined ${room}`);
    await interactiveHelper(socket, io);

}

async function interactiveHelper(socket, io) {
    console.log(`SERVER: Running interactiveHelper for room: ${socket.room}`);
    if (!socket.room) {
        console.warn('SERVER: Socket has no room. Aborting interactiveHelper.');
        return;
    }

    try {
        const gameData = await getGame(socket.room);
        if (!gameData) {
            console.error(`SERVER: Game data for room ${socket.room} not found.`);
            return;
        }

        if (gameData.winner) {
            io.to(socket.room).emit("winner", gameData.winner);
            return;
        }

        const connectedSockets = await io.in(socket.room).fetchSockets();
        let nextPlayer, nextPlayerId;
        const isPlayer1Turn = gameData.moves % 2 === 0;

        if (isPlayer1Turn) {
            nextPlayer = "player1";
            nextPlayerId = gameData.player1;
        } else {
            nextPlayer = "player2";
            nextPlayerId = gameData.player2;
        }

        const turnMessage = `It is currently ${nextPlayer}'s turn`;

        const updatedGameData = await updateGame(socket.room, {
            "currentplayer": nextPlayer,
            "currentid": nextPlayerId
        });
        if (TEST_MODE_ONE_PLAYER_CONTROLS_ALL) {
         const player1Socket = io.sockets.sockets.get(updatedGameData.player1);
        // 3. Check if the socket exists (the player might be disconnected)
            if (player1Socket) {
    // 4. Send the event directly to that specific socket
    player1Socket.emit("setplayerturntopic", turnMessage);
    if (updatedGameData.currentid === updatedGameData.player1) {
        player1Socket.emit("switchplayer",1);
    } else {
        player1Socket.emit("switchplayer",2);
    }
}

        }
        // Loop through the actual connected sockets to update their state
        else{
        connectedSockets.forEach(s => {
            s.userRoom = updatedGameData; // Keep all sockets' local state in sync
            s.emit("setplayerturntopic", turnMessage);

            // Control interactivity based on whose turn it is
            if (s.id === updatedGameData.currentid) {
                s.emit("enableinteractive");
            } else {
                s.emit("disableinteractive");
            }
        })
        }
       

        console.log(`SERVER: ✅ interactiveHelper finished. Current player is ${nextPlayer}`);
    } catch (error) {
        console.error('SERVER: An error occurred in interactiveHelper:', error);
    }
}
async function processMove(socket, io, startdex, endex) {
    const gameData = await getGame(socket.room);
    
    // Calculate the result of the move, including the final piece sets and any winner.
    const moveResult = socket.board.updateBoard(startdex, endex);

    const update = {
        "moves": gameData.moves + 1,
        "currentplayer": null,
        "currentid": null,
        ...moveResult 
    };

    // Save the complete final state (including the winner) to the database.
    socket.userRoom = await updateGame(socket.room, update);
    
    // 1. ALWAYS send the final move so the client's board is visually updated.
    io.to(socket.room).emit("sendmove", startdex, endex);

    // 2. Immediately call interactiveHelper. It will read the new 'winner' state
    //    from the database and send the appropriate 'winner' or 'enableinteractive' event.
    await interactiveHelper(socket, io);
}

function validateMove(socket, io, startdex, endex) {
    if (!socket.board || !socket.userRoom) {
        console.warn(`SERVER: ⚠️ Validation failed for socket ${socket.id}. Board or userRoom not found.`);
        return false;
    }
    if ((socket.id !== socket.userRoom.currentid) && !TEST_MODE_ONE_PLAYER_CONTROLS_ALL) {
        io.to(socket.id).emit("sendalert", "You are not the current player");
        return false;
    }

    // First, validate the piece selection
    let validationResult = socket.board.validatePiece(startdex);
    if (typeof validationResult === 'string') {
        io.to(socket.id).emit("sendmove", startdex, startdex, false);
        io.to(socket.id).emit("sendalert", validationResult); // Use the custom message from validatePiece
        io.to(socket.id).emit("enableinteractive");
        return false;
    }

    // If piece validation passes, proceed to validate the move
    validationResult = socket.board.validateMove(startdex, endex);
    if (typeof validationResult === 'string') {
        io.to(socket.id).emit("sendmove", startdex, startdex, false);
        io.to(socket.id).emit("sendalert", validationResult); // Use the custom message from validateMove
        io.to(socket.id).emit("enableinteractive");
        return false;
    }
    
    // If all validations pass, return true
    return true;
}

async function getcurrentPlayer(socket, forced) {
    if (forced && socket.room) {
        const gameData = await getGame(socket.room);
        return gameData ? gameData.currentplayer : null;
    }
    return socket.userRoom ? socket.userRoom.currentplayer : null;
}

async function updatePlayerStatus(io, room) {
    if (!room) return;

    try {
        const connectedSockets = await io.in(room).fetchSockets();
        const playerStatuses = [
            { player: 'player1', connected: false },
            { player: 'player2', connected: false }
        ];

        // Populate the status based on connected sockets
        connectedSockets.forEach(s => {
            const gameData = s.userRoom;
            if (gameData) {
                if (gameData.player1 === s.id) {
                    playerStatuses[0].connected = true;
                } else if (gameData.player2 === s.id) {
                    playerStatuses[1].connected = true;
                }
            }
        });

        // Emit the structured status data to all clients in the room
        io.to(room).emit('playerstatus', playerStatuses);

    } catch (error) {
        console.error('SERVER: Error updating player status:', error);
    }
}