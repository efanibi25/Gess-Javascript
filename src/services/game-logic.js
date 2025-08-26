
import { getGame, updateGame, getNextMoveFromQueue } from './redis.js';
import { TEST_MODE_ONE_PLAYER_CONTROLS_ALL } from '../shared/config.js';
import { interactiveHelper } from './game-room.js';
export async function processMoveQueue(gameKey, io) {
    while (true) { 
        const nextMove = await getNextMoveFromQueue(gameKey);
        if (!nextMove) {
            // Queue is empty, exit the loop
            break;
        }

        console.log("Got next move from queue");
        const gameState = await getGame(gameKey);
        

        // Check for invalid game state AFTER getting the move.
        // This prevents an empty queue from blocking the processor.
        if (!gameState || gameState.winner || !gameState.currentplayer) {
            // Game is over or invalid, so we exit the loop.
            // Any remaining moves in the queue will be handled if the game state changes.
            break;
        }

        const sockets = await io.in(gameKey).fetchSockets();
        const playerSocket = sockets.find(s => s.id === nextMove.playerID);
        if (!playerSocket) {
            // Player not found, move on to the next item in the queue
            continue;
        }
        const finalEndIndex = playerSocket.board._calculateFinalDestination(nextMove.startIndex, nextMove.endIndex);

        
        const moveResult = playerSocket.board.processMove(nextMove.startIndex, finalEndIndex, playerSocket);
        console.log(`Move Result: ${JSON.stringify(moveResult)}`);

        if (!moveResult.success) {
            io.to(nextMove.playerID).emit("sendmove", nextMove.startIndex, nextMove.startIndex, false);
            io.to(nextMove.playerID).emit("sendalert", moveResult.message);
            io.to(nextMove.playerID).emit("enableinteractive");
        } else {


              // Calculate the result of the move, including the final piece sets and any winner.
    const moveResult = playerSocket.board.updateBoard(nextMove.startIndex, finalEndIndex);
    const isPlayer1Turn = gameState.currentplayer === "player1";
            const nextPlayer = isPlayer1Turn ? "player2" : "player1";
            const nextPlayerId = isPlayer1Turn ? gameState.player2 : gameState.player1;

    const update = {
        "moves": gameState.moves + 1,
        "currentplayer": nextPlayer,
        "currentid": nextPlayerId,
        ...moveResult 
    };

    // Save the complete final state (including the winner) to the database.
    playerSocket.userRoom = await updateGame(playerSocket.room, update);
    
    // 1. ALWAYS send the final move so the client's board is visually updated.
    io.to(playerSocket.room).emit("sendmove", nextMove.startIndex, finalEndIndex);

    // 2. Immediately call interactiveHelper. It will read the new 'winner' state
    //    from the database and send the appropriate 'winner' or 'enableinteractive' event.
    await interactiveHelper(playerSocket, io);

            

            
        }
        // The loop will automatically continue to the next iteration
    }
}

export async function getcurrentPlayer(socket, forced) {
    if (forced && socket.room) {
        const gameData = await getGame(socket.room);
        return gameData ? gameData.currentplayer : null;
    }
    return socket.userRoom ? socket.userRoom.currentplayer : null;
}