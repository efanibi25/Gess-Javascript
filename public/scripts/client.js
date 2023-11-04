  
const TIMEOUT=5000000
const RETRY=false
export const gameID=window.location.pathname.split("/").pop()
export const data={"currentplayer":null,"playerstatus":"waiting on server"}
export const socket = io(`http://localhost:${server}`,{
    query: {
        socketId: getSocketID() || ''
      }
  });

//local storage
export function getSocketID(){
    return localStorage.getItem(`socketid_${gameID}`);
}


export function setSocketID(id){
    localStorage.setItem(`socketid_${gameID}`,id);
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
export async function setCurrentPlayerIndicator(){
  let player=await getCurrentPlayer(true)
    if(player==null){
      player="waiting on server"
      data["playerstatus"]=player
      document.querySelector("#alertBar").textContent=player
    }
    else{
      player=`It is currently ${player} turn`
      data["playerstatus"]=player
      document.querySelector("#alertBar").textContent=player
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