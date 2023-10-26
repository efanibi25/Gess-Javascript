export const gameID=window.location.pathname.split("/").pop()
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
    return localStorage.getItem(`player_${gameID}`);
}

export function setPlayerNumber(num){
    localStorage.setItem(`player_${gameID}`,num);
}


export function emit(socket, event, ...args) {
    socket.timeout(5000).emit(event, ...args, (err) => {
      if (err) {
        // no ack from the server, let's retry
        emit(socket, event, ...args);
      }
    });
  }