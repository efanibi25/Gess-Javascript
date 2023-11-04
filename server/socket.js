const httpServer= require("http").createServer();
const {addGameList,getGame, updateGame}= require("./redis.js")
const {BoardMax,squaresCount,sideborder}=require("../res/player.js")
const {board}=require("./board.js")
require('dotenv').config(".env")

// const gessBoard =require("../public/classes/board.js")
const { Server } = require("socket.io");
const url = require('url')
const base64id = require('base64id');




const io = new Server(httpServer, {
  cors: {
    origin:/\.*/,
    methods: ["GET", "POST"],
  }
});

io.engine.generateId = req => {

  const parsedUrl = new url.parse(req.url,true)
  const prevId = parsedUrl.query.socketId
  if (prevId.length>0) {
    return prevId
  }
  return base64id.generateId()
}

io.use((socket, next) => {
  socket.id = socket.conn.id
  next();
});
io.on('connection', (socket) => {
  console.log(`a user connected: ${socket.id}`);
  socket.on("creategame", async (room,callback) => {
    console.log(`creating game and joining ${room}`);


  let game=(async()=>{

  
    await addGameList(room)
    let userRoom=await getGame(room)
    socket.room=room;
    socket.userRoom=userRoom;
  });

//join game
  let join=(async()=>{
    let player=null

    if(socket.userRoom['player1']==socket.id){
      player="player1"
      socket.join(room);
      socket.playerID=socket.id
      socket.otherplayer="player2"
      socket.usersByRoom=await updateGame(room,{
        "player1":socket.id
      })
      socket.board=new board(socket.usersByRoom["player1Pieces"],
      socket.usersByRoom["player2Pieces"],socket.usersByRoom["player1Rings"],1)
    
    }
    else if(socket.userRoom['player2']==socket.id){
      player="player2"
      socket.join(room);
      socket.playerID=socket.id
      socket.otherplayer="player1"
      socket.usersByRoom=await updateGame(room,  {
        "player2":socket.id
      })
      socket.board=new board(socket.usersByRoom["player2Pieces"],
      socket.usersByRoom["player1Pieces"],socket.usersByRoom["player2Rings"],2)

    }

  
    else if(! socket.userRoom["player1"]){
      player="player1"
      socket.join(room);
      socket.playerID=socket.id
      socket.otherplayer="player2"
      socket.usersByRoom=await updateGame(room,
      {
        "player1":socket.id
      }
      )
      socket.board=new board(socket.usersByRoom["player1Pieces"],
      socket.usersByRoom["player2Pieces"],socket.usersByRoom["player1Rings"],1)

    }
  
  
    else if(! socket.userRoom["player2"]){
      player="player2"
      socket.join(room);
      socket.playerID=socket.id
      socket.otherplayer="player1"

      socket.usersByRoom=await updateGame(room,  {
      "player2":socket.id
    }
    )
    socket.board=new board(socket.usersByRoom["player2Pieces"],socket.usersByRoom["player1Pieces"],
    socket.usersByRoom["player2Rings"],2)

    } 
    else{
      return
    }

    socket.emit("setdata",player,BoardMax,socket.userRoom["player1Pieces"],socket.userRoom["player2Pieces"],squaresCount,sideborder)

    console.log([player,socket.id,"has joined",room])



  })

  await game()
  await join()
  
  callback({
    response: "ok"
  });
  })


  socket.on("sendmove", async (startdex,endex,callback) => {
    console.log(["sending move",socket.id,socket.userRoom["currentid"]])
    if(socket.id!=socket.userRoom["currentid"]){
      io.to(socket.id).emit("sendmove",startdex,startdex,false);
      io.to(socket.id).emit("sendalert","You are not the current player");
      callback({
        response: "ok"
      });
    }
    else if(!socket.board.validatePiece(startdex)){
    io.to(socket.id).emit("sendmove",startdex,startdex,false);
    io.to(socket.id).emit("sendalert","The Piece is Not valid");
    callback({
      response: "ok"
    });

    


    }


    else if(!socket.board.validateMove(startdex,endex)){
      io.to(socket.id).emit("sendmove",startdex,startdex,false);
      io.to(socket.id).emit("sendalert","The Given Move is not valid");
      callback({
        response: "ok"
      });
  
    
      io.to(socket.id).emit("enableinteractive")
  
      }



    else{
      let game=await getGame(socket.room)
      endex= socket.board.getMaxMovement(startdex,endex)
      let update={...{"moves":game["moves"]+1,"currentplayer":null,"currentid":null},...socket.board.updateBoard(startdex,endex)}
      socket.usersRoom=await updateGame(socket.room,update)
      io.to(socket.room).emit("sendmove",startdex,endex)
      callback({
        response: "ok"
      });      io.to(socket.id).emit("enableinteractive")

    }
   
  })
  io.to(socket.id).emit("enableinteractive")



  socket.on("getcurrentplayer", async(forced,callback) => {
    console.log(`getting player`)

    if (forced){
      let player=(await getGame(socket.room))["currentplayer"]
      callback({
        response:player
      });

    }
    else if(!socket.userRoom){
      callback({'error': 'retry getting player'});

    }
    else{
      console.log(["current player",socket.userRoom["currentplayer"]])
      callback({
        response:socket.userRoom["currentplayer"]
      });
    }
    
  });



 
  socket.on("toggleinteractive", async(callback) => {
    console.log(["ready to set interactive",socket.room,socket.userRoom!=null])
    let sockets=await io.in(socket.room).fetchSockets()
    if(!socket.userRoom){
      callback({
        response: "ok"
       });
       return
    
    }
  
      //switch player
      let game=await getGame(socket.room)
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
      callback({
        response: "ok"
       });
    }
  



  )




  socket.on('disconnect', async () => {
    console.log('user disconnected saving room');
    //some changes for without redux
    (await io.in(socket.room).fetchSockets()).forEach(e=>e.emit("creategame"))

  });
});

// io.of("/").adapter.on("create-room", (room) => {
//   console.log(`room ${room} was created`);
// });

// io.of("/").adapter.on("join-room", (room, id) => {
//   console.log(`socket ${id} has joined room ${room}`);1,; c
// });


const port= process.env.SERVER_PORT

httpServer.listen(port, function () {
    console.log('Server started! on port',port)
});
