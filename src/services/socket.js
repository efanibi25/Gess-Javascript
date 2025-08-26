// services/socket.js

import url from 'url';
import base64id from 'base64id';
import { createOrJoinGame, updatePlayerStatus, interactiveHelper } from './game-room.js';
import { processMoveQueue } from './game-logic.js';
import { addMoveToQueue, acquireLock, releaseLock } from './redis.js';
const gameProcessingLocks = {};

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
        });

        socket.on('sendmove', async (startdex, endex) => {
            const gameKey = socket.room;
            if (!gameKey) return;
            
            // Step 1: Add the move to the queue immediately.
            await addMoveToQueue(gameKey, {
                playerID: socket.id,
                startIndex: startdex,
                endIndex: endex
            });
            
            // Step 2: Use an in-memory flag to prevent this server from
            // trying to acquire a lock if another process on this same server is already trying.
            if (gameProcessingLocks[gameKey]) {
                return;
            }
            gameProcessingLocks[gameKey] = true;

            const lockKey = `game:${gameKey}:lock`;
            let redisLock = null;

            try {
                // Step 3: Attempt to acquire the distributed Redis lock.
                redisLock = await acquireLock(lockKey);
                
                if (redisLock) {
                    // Step 4: If the lock is successfully acquired, process the moves.
                    await processMoveQueue(gameKey, io);
                } else {
                    console.log(`Lock for game ${gameKey} is already held. Another process is handling the queue.`);
                }
            } catch (error) {
                console.error('Error during lock or move processing:', error);
            } finally {
                // Step 5: Always release the locks.
                if (redisLock) {
                    await releaseLock(redisLock);
                }
                delete gameProcessingLocks[gameKey];
            }
        });

        socket.on("gamestate", async () => {
            if (socket.room) {
                await interactiveHelper(socket, io);
            }
        });

        socket.on('disconnect', async () => {
            console.log(`SERVER: 🔴 User ${socket.id} disconnected`);
            if (socket.room) {
                await updatePlayerStatus(io, socket.room);
            }
        });
    });
}