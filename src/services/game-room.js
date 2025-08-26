
import { getGame, updateGame, addGameList } from './redis.js';
import { BoardMax, squaresCount, sideborder, TEST_MODE_ONE_PLAYER_CONTROLS_ALL } from '../shared/config.js';
import { Board } from './board/board.js';



export async function createOrJoinGame(socket, room, io) {
    console.log(`SERVER: Running createOrJoinGame for socket ${socket.id}`);
    
    await addGameList(room);
    socket.room = room;

    let latestGameData = await getGame(room);
    if (!latestGameData) {
        console.error(`SERVER: ❌ Game room ${room} not found.`);
        return;
    }

    let updates = {};
    let isNewPlayer = false;

    // A: Handle existing players reconnecting
    if (latestGameData.player1 === socket.id || latestGameData.player2 === socket.id) {
        console.log(`SERVER: ✅ Player ${socket.id} is reconnecting to room ${room}`);
    } 
    // B: Handle new players joining
    else if (!latestGameData.player1) {
        updates.player1 = socket.id;
        updates.currentplayer = "player1";
        updates.currentid = socket.id;
        isNewPlayer = true;
        console.log(`SERVER: ✅ Setting player1 to ${socket.id} in room ${room}`);
    } else if (!latestGameData.player2) {
        updates.player2 = socket.id;
        updates.currentid = latestGameData.currentplayer === "player2" ? socket.id : latestGameData.currentid;
        isNewPlayer = true;
        console.log(`SERVER: ✅ Setting player2 to ${socket.id} in room ${room}`);
    } 
    // C: Handle a full room
    else {
        socket.emit("full");
        console.log(`SERVER: ❌ Room ${room} is full. Player ${socket.id} cannot join.`);
        return;
    }

    if (Object.keys(updates).length > 0) {
        latestGameData = await updateGame(room, updates);
    }
    
    // Continue with the rest of the function for both new and reconnecting players
    const playerNumber = latestGameData.player1 === socket.id ? 1 : 2;
    const player = latestGameData.player1 === socket.id ? "player1" : "player2";

    await socket.join(room);
    socket.userRoom = latestGameData;

    if (playerNumber === 1) {
        socket.board = new Board(latestGameData.player1Pieces, latestGameData.player2Pieces, latestGameData.player1Rings, latestGameData.player2Rings, 1);
    } else {
        socket.board = new Board(latestGameData.player2Pieces, latestGameData.player1Pieces, latestGameData.player2Rings, latestGameData.player1Rings, 2);
    }
    socket.emit("setdata", player, BoardMax, latestGameData.player1Pieces, latestGameData.player2Pieces, squaresCount, sideborder);
    console.log(`SERVER: ✅ ${player} (${socket.id}) has successfully joined ${room}`);
    
    await updatePlayerStatus(io, room);
    await interactiveHelper(socket, io);
}

export async function updatePlayerStatus(io, room) {
    if (!room) return;
    const gameDataForRoom = await getGame(room);
    if (!gameDataForRoom) return;

    try {
        const connectedSockets = await io.in(room).fetchSockets();
        const playerStatuses = [
            { player: 'player1', connected: false },
            { player: 'player2', connected: false }
        ];

        connectedSockets.forEach(s => {
            if (gameDataForRoom.player1 === s.id) playerStatuses[0].connected = true;
            if (gameDataForRoom.player2 === s.id) playerStatuses[1].connected = true;
        });
        
        io.to(room).emit('playerstatus', playerStatuses);
    } catch (error) {
        console.error('SERVER: Error updating player status:', error);
    }
}


export async function interactiveHelper(socket, io) {
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

        // The key change: The game state is now read-only.
        // We'll use the 'currentid' and 'currentplayer' already stored in Redis.
        const turnMessage = `It is currently ${gameData.currentplayer}'s turn`;

        if (TEST_MODE_ONE_PLAYER_CONTROLS_ALL) {
            const player1Socket = io.sockets.sockets.get(gameData.player1);
            if (player1Socket) {
                player1Socket.emit("setplayerturntopic", turnMessage);
                if (gameData.currentid === gameData.player1) {
                    player1Socket.emit("switchplayer", 1);
                } else {
                    player1Socket.emit("switchplayer", 2);
                }
            }
        } else {
            const connectedSockets = await io.in(socket.room).fetchSockets();
            connectedSockets.forEach(s => {
                s.userRoom = gameData; // Keep local state in sync
                s.emit("setplayerturntopic", turnMessage);

                // Control interactivity based on whose turn it is
                if (s.id === gameData.currentid) {
                    s.emit("enableinteractive");
                } else {
                    s.emit("disableinteractive");
                }
            });
        }
        console.log(`SERVER: ✅ interactiveHelper finished. Current player is ${gameData.currentplayer}`);
    } catch (error) {
        console.error('SERVER: An error occurred in interactiveHelper:', error);
    }
}


