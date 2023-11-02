  
export const gameID=window.location.pathname.split("/").pop()
export const data={"currentplayer":"waiting on server"}
export const socket = io(`http://localhost:${server}`,{
    query: {
        socketId: getSocketID() || ''
      }
  });


export function getSocketID(){
    return localStorage.getItem(`socketid_${gameID}`);
}


export function setSocketID(id){
    localStorage.setItem(`socketid_${gameID}`,id);
}

export function getPlayerNumber(){
    return localStorage.getItem(`player_${gameID}`);
}

export async function getCurrentPlayer(){
  return await emitPromise(socket,"getcurrentplayer")

}
export async function setCurrentPlayerIndicator(){
  let player=await getCurrentPlayer()
    if(player==null){
      player="waiting on server"
      document.querySelector("#alertBar").textContent=player
    }
    else{
      document.querySelector("#alertBar").textContent=`It is currently ${player} turn`
    }
    data["currentplayer"]=player
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