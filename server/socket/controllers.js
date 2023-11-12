const { addGameList,getGame,updateGame } = require("../redis.js");
//gameboard
const {board}=require("../board.js")
const {BoardMax,squaresCount,sideborder}=require("../../res/player.js")

 function validateMove(socket,io,startdex,endex){
  console.log(["sending move",socket.id,socket.userRoom["currentid"]])
  if(!socket.board || !socket.userRoom){
    return false
  }
  
  else if(socket.id!=socket.userRoom["currentid"]){
      io.to(socket.id).emit("sendmove",startdex,startdex,false);
      io.to(socket.id).emit("sendalert","You are not the current player");
    }
    else if(!socket.board.validatePiece(startdex)){
    io.to(socket.id).emit("sendmove",startdex,startdex,false);
    io.to(socket.id).emit("sendalert","The Piece is Not valid");
   return false
  
    }

    else if(!socket.board.validateMove(startdex,endex)){
      io.to(socket.id).emit("sendmove",startdex,startdex,false);
      io.to(socket.id).emit("sendalert","The Given Move is not valid");

    
      io.to(socket.id).emit("enableinteractive")
      return false

  
      }
      return true
}
async function processMove(socket,io,startdex,endex){
        let game=await getGame(socket.room)
      endex= socket.board.getMaxMovement(startdex,endex)
      let update={...{"moves":game["moves"]+1,"currentplayer":null,"currentid":null},...socket.board.updateBoard(startdex,endex)}
      socket.usersRoom=await updateGame(socket.room,update)
      //winner needs to be picked based on current user
      if(socket.userRoom["winner"]!=null) io.to(socket.room).emit("winner",socket.userRoom["winner"])
      else io.to(socket.room).emit("sendmove",startdex,endex)
}

async function join(socket,room){
    let player=null
    
      if(socket.userRoom['player1']==socket.id){
        player="player1"
        socket.emit("setdata",player,BoardMax,socket.userRoom["player1Pieces"],socket.userRoom["player2Pieces"],squaresCount,sideborder)
        socket.join(room);
        socket.playerID=socket.id
        socket.otherplayer="player2"
        socket.usersByRoom=await updateGame(room,{
          "player1":socket.id
        })
        socket.board=new board(socket.usersByRoom["player1Pieces"],
        socket.usersByRoom["player2Pieces"],socket.usersByRoom["player1Rings"],socket.usersByRoom["player2Rings"],1)
      
      }
      else if(socket.userRoom['player2']==socket.id){
        player="player2"
        socket.emit("setdata",player,BoardMax,socket.userRoom["player1Pieces"],socket.userRoom["player2Pieces"],squaresCount,sideborder)
        socket.join(room);
        socket.playerID=socket.id
        socket.otherplayer="player1"
        socket.usersByRoom=await updateGame(room,  {
          "player2":socket.id
        })
        socket.board=new board(socket.usersByRoom["player2Pieces"],
        socket.usersByRoom["player1Pieces"],socket.usersByRoom["player2Rings"],socket.usersByRoom["player1Rings"],2)
  
      }
  
    
      else if(! socket.userRoom["player1"]){
        player="player1"
        socket.emit("setdata",player,BoardMax,socket.userRoom["player1Pieces"],socket.userRoom["player2Pieces"],squaresCount,sideborder)
        socket.join(room);
        socket.playerID=socket.id
        socket.otherplayer="player2"
        socket.usersByRoom=await updateGame(room,
        {
          "player1":socket.id
        }
        )
        socket.board=new board(socket.usersByRoom["player1Pieces"],
        socket.usersByRoom["player2Pieces"],socket.usersByRoom["player1Rings"],socket.usersByRoom["player2Rings"],1)
  
      }
    
    
      else if(! socket.userRoom["player2"]){
        player="player2"
        socket.emit("setdata",player,BoardMax,socket.userRoom["player1Pieces"],socket.userRoom["player2Pieces"],squaresCount,sideborder)
        socket.join(room);
        socket.playerID=socket.id
        socket.otherplayer="player1"
  
        socket.usersByRoom=await updateGame(room,  {
        "player2":socket.id
      }
      )
      socket.board=new board(socket.usersByRoom["player2Pieces"],socket.usersByRoom["player1Pieces"],
      socket.usersByRoom["player2Rings"],socket.usersByRoom["player1Rings"],2)
  
      } 
      else{
        socket.emit("full")
      }
    
    
      console.log([player,socket.id,"has joined",room])
  
  }
  
  async function game(socket,room){
    await addGameList(room)
    let userRoom=await getGame(room)
    socket.room=room;
    socket.userRoom=userRoom;
  }

  async function getcurrentPlayer(socket,forced){

    if (forced){
      let player=(await getGame(socket.room))["currentplayer"]
      return player


    }
    else if(!socket.userRoom){
      return

    }
    else{
      console.log(["current player",socket.userRoom["currentplayer"]])
      return socket.userRoom["currentplayer"]
    }
  }

  async function checkprocessSwitch(socket,io,game){
    if(!socket.userRoom,game){
       return false
    
    }
 
      if (game["winner"]!=null){
        io.to(socket.room).emit("winner",game["winner"])
        return  false
      }
  }

  async function processSwitch(socket,io,game){
    let sockets=await io.in(socket.room).fetchSockets()

      //switch player
      if (game["moves"]==0){
        socket.userRoom=await updateGame(socket.room,{"currentplayer":"player1","currentid":game["player1"],"otherplayer":"player2","otherid":game["player2"]})
      }
      else if(game["moves"]%2==0){
        socket.userRoom=await updateGame(socket.room,{"currentplayer":"player1","currentid":game["player1"],"otherplayer":"player2","otherid":game["player2"]})
       }
       else{     
        socket.userRoom=await updateGame(socket.room,{"currentplayer":"player2","currentid":game["player2"],"otherplayer":"player1","otherid":game["player1"]})
       }

      console.log(["setting interactive/player switched",socket.userRoom])

      //toggle interactive
      if (socket.id==socket.userRoom["currentid"])io.to(socket.userRoom["currentid"]).emit("enableinteractive");
      else if (socket.id==socket.userRoom["otherid"])io.to(socket.userRoom["otherid"]).emit("disableinteractive");
      
      //send player indicator
      sockets.forEach(e=>e.emit("setplayerindicator",socket.userRoom["currentplayer"]))
     
  }

  async function interactiveHelper(socket,io){
    let game=await getGame(socket.room)
    if(checkprocessSwitch(socket,io,game)){
      await processSwitch(socket,io,game)
    }
  }
module.exports={join,game,validateMove,processMove,getcurrentPlayer,interactiveHelper}



