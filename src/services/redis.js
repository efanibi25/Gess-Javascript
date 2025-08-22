const redis = require('redis');
const {PLAYER1_PIECES,PLAYER2_PIECES,PLAYER2_RINGS,PLAYER1_RINGS}=require("../shared/player.js")

const client = redis.createClient({socket: {
    connectTimeout:500
    },});


client.on('error', err => console.log('Redis Client Error', err));
(async()=>{
    await client.connect();

})();
async function addGameList(key){
    if(!await checkGameExists(key)){
        await client.sAdd('games',key) 
        await client.set(key,JSON.stringify({
                  "player1":null,
                  "player2":null,
                  "player1Pieces":(Array.from(PLAYER1_PIECES)),
                  "player2Pieces":(Array.from(PLAYER2_PIECES)),
                  "player1Rings":(Array.from(PLAYER1_RINGS)),
                  "player2Rings":(Array.from(PLAYER2_RINGS)),
                  "currentplayer":null,
                  "moves":0,
                  "winner":null

            }))
    }
}

async function checkGameFree(key){
    if(await checkGameExists(key)){
      let game=await getGame(key)
      return game["player1"]==null || game["player2"]==null
    }
    else{
        return true 
    }
}

async function checkGameExists(key){
    if(await client.sIsMember('games',key)==1){
return true
    }
    return false

}

async function updateGame(key,dict){
   let  current={...await getGame(key),...dict}
    await client.set(key,JSON.stringify(current))
    return current
}

async function getGame(key){
    return JSON.parse(await client.get(key))
}


module.exports={client,checkGameExists,checkGameFree,addGameList,updateGame,getGame}

