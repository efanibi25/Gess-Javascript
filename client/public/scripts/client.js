export const gameID=window.location.pathname.split("/").pop()


export const data={}

export const socket = io(`http://localhost:7000`,{
    query: {
        socketId: getSocketID() || ''
      }
  });


export function getSocketID(){
    return localStorage.getItem(`gess_game_${gameID}`);
}


export function setSocketID(id){
    localStorage.setItem(`gess_game_${gameID}`,id);
}

export function getPlayerNumber(){
     localStorage.getItem(`player_${gameID}`) || null;
}

export async function getCurrentPlayer(){
  return await emitPromise(socket,"getplayer")

}
export async function setCurrentPlayerIndicator(){
  let player=await getCurrentPlayer()
    if(player==null){
      player="waiting on server"
      document.querySelector("#alertBar").textContent=player
      return
    }
    document.querySelector("#alertBar").textContent=`It is currently ${player} turn`

}

export function setPlayerNumber(num){
    (num!=null && num!=undefined) ? localStorage.setItem(`player_${gameID}`,num) : null
}


export function setGameData(key,value){
  data[key]=value
}




export function emit(event, ...args) {
    socket.timeout(5000).emit(event, ...args, (socket_err,input) => {
      
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
        if (socket_err ||error) {
          // no ack from the server, let's retry
          emit(socket, event, ...args);
        }
        resolve(response)
        
        
      });
    })
   
  }