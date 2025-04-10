  
const TIMEOUT=5000000
const RETRY=false
export const gameID=window.location.pathname.split("/").pop()
export const data={"currentplayer":null,"playerstatus":"waiting on server"}
export const socket = io(`${server}`,{
  query: {
      socketId: getSocketID() || ''
    },
    transports:
    ['websocket'] }, { 'force new connection': true
});

//local storage
export function getSocketID(){
    return localStorage.getItem(`socketid_${gameID}`);
}


export function setSocketID(id){
  // fix for nodemon
    if(!getSocketID()){
    localStorage.setItem(`socketid_${gameID}`,id);
    }
}

export function getPlayerNumber(){
    return localStorage.getItem(`player_${gameID}`);
}

export function setPlayerNumber(num){
  (num!=null && num!=undefined) ? localStorage.setItem(`player_${gameID}`,num) : null
}

// server retrival
export async function getCurrentPlayer(forced){
  let player=await emitPromise(socket,"getcurrentplayer",forced)
  data["currentplayer"]=player
  return player

}
export async function setCurrentPlayerIndicator(forced=true,local=false){
  let player=null
  if(!local){
  player=await getCurrentPlayer(forced)
  }
  else{
    player= data["player"]
  }
  setLocalPlayerStatus(player)
  document.querySelector("#alertBar").textContent=data["playerstatus"]

  
}
export function setLocalPlayerStatus(player){
  if(player==null){
    let status="waiting on server"
    data["playerstatus"]=status
    data["player"]=player

  }
  else{
    let status=`It is currently ${player} turn`
    data["playerstatus"]=status
    data["player"]=player
  }
}






export function setGameData(key,value){
  data[key]=value
}


//emit

export function emit(event, ...args) {
    socket.timeout(TIMEOUT).emit(event, ...args, (socket_err,input) => {
      
      let {error,response}=input || {}
      if (socket_err ||error) {
        // no ack from the server, let's retry
        emit( event, ...args);
      }
      if(response){
        console.log(response)
      }
      
    });
  }


  export async function emitPromise(socket, event, ...args) {
    return new Promise(function(resolve, reject) {
      socket.timeout(5000).emit(event, ...args, (socket_err,input) => {
        let {error,response}=input || {}
        if (RETRY&&(socket_err ||error)) {
          // no ack from the server, let's retry
          emit(socket, event, ...args);
        }
        resolve(response)
        
        
      });
    })
   
  }