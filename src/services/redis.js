import { createClient } from 'redis';
import { PLAYER1_PIECES, PLAYER2_PIECES, PLAYER2_RINGS, PLAYER1_RINGS } from "../shared/player.js";

const redisUrl = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`;

const client = createClient({
    url: redisUrl,
    socket: { connectTimeout: 500 }
});

client.on('error', err => console.log('Redis Client Error', err));

(async () => {
    await client.connect();
})();

async function addGameList(key) {
    if (!await checkGameExists(key)) {
        // Use a transaction to make the game initialization atomic
        const multi = client.multi();
        multi.sAdd('games', key);
        multi.set(key, JSON.stringify({
            "player1": null,
            "player2": null,
            "player1Pieces": Array.from(PLAYER1_PIECES),
            "player2Pieces": Array.from(PLAYER2_PIECES),
            "player1Rings": Array.from(PLAYER1_RINGS),
            "player2Rings": Array.from(PLAYER2_RINGS),
            "currentplayer": null,
            "currentid": null,
            "moves": 0,
            "winner": null
        }));
        await multi.exec();
    }
}

async function checkGameFree(key) {
    if (await checkGameExists(key)) {
        const game = await getGame(key);
        return game.player1 == null || game.player2 == null;
    }
    return true;
}

async function checkGameExists(key) {
    return await client.sIsMember('games', key);
}

async function updateGame(key, dict) {
    const lockKey = `update:${key}:lock`;
    let lock = null;
    try {
        lock = await acquireLock(lockKey);
        if (!lock) {
            throw new Error('Failed to acquire update lock');
        }

        const current = { ...await getGame(key), ...dict };
        await client.set(key, JSON.stringify(current));
        return current;
    } finally {
        if (lock) {
            await releaseLock(lock);
        }
    }
}

async function getGame(key) {
    const gameData = await client.get(key);
    return gameData ? JSON.parse(gameData) : null;
}

async function addMoveToQueue(gameKey, moveData) {
    const queueKey = `${gameKey}:queue`;
    await client.rPush(queueKey, JSON.stringify(moveData));
}

async function getNextMoveFromQueue(gameKey) {
    const queueKey = `${gameKey}:queue`;
    const moveDataString = await client.lPop(queueKey);
    return moveDataString ? JSON.parse(moveDataString) : null;
}

async function acquireLock(lockKey, timeout = 5000) {
    const lockValue = Math.random().toString(36).substring(2, 15);
    const result = await client.set(lockKey, lockValue, {
        nx: true,
        px: timeout
    });

    if (result === 'OK') {
        return { key: lockKey, value: lockValue };
    }
    return null;
}

async function releaseLock(lock) {
    const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
            return redis.call("del", KEYS[1])
        else
            return 0
        end
    `;
    await client.eval(script, {
        keys: [lock.key],
        arguments: [lock.value]
    });
}

export {
    client,
    checkGameExists,
    checkGameFree,
    addGameList,
    updateGame,
    getGame,
    addMoveToQueue,
    getNextMoveFromQueue,   
    acquireLock,
    releaseLock
};