const httpServer= require("http").createServer();
const path = require('path');
require('dotenv').config({ path: path.join(path.dirname(__dirname),".env") })
const {BoardMax,PLAYER1_PIECES,PLAYER2_PIECES,squaresCount,sideborder}=require("./res/player.js")
const { Server } = require("socket.io");
const url = require('url')
const base64id = require('base64id');


let usersByRooms = {}
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
io.on('connection', (socket) => {

  console.log(`a user connected: ${socket.id}`);

  socket.on("creategame", (room,callback) => {
  console.log(`current room ${JSON.stringify(usersByRooms[room])}`)
  if(!usersByRooms[room]){
    usersByRooms[room]={
      "player1":null,
      "player2":null,
      "currentplayer":null,
      "otherplayer":null,
      "room":room,
      "ready":0,
      "playerID":null
}
  }

  //save 
  socket.usersByRooms=usersByRooms[room]

  callback({
    response: "ok"
  });
  socket.emit("joingame")
  })



  socket.on("sendmove", (startdex,endex,callback) => {
    socket.usersByRooms["currentplayer"]=null
    io.to(socket.usersByRooms[socket.usersByRooms["otherplayer"]]).emit("sendmove",startdex,endex);
    callback({
      response: "ok"
    });
  })


  socket.on("switchplayer", (callback) => {
    console.log("switchplayer")
    console.log(["before switch",socket.usersByRooms])
   if(socket.usersByRooms["otherplayer"]=="player1"){
    socket.usersByRooms["currentplayer"]="player1"
    socket.usersByRooms["otherplayer"]="player2"
   }
   else{
    socket.usersByRooms["currentplayer"]="player2"
    socket.usersByRooms["otherplayer"]="player1"
   }
    console.log(["after switch",socket.usersByRooms])
   io.emit("setplayerindicator",socket.usersByRooms["currentplayer"])
   callback({
    response: "ok"
  });
  })




  socket.on("getplayer", (callback) => {
    console.log(`getting player`)
  

    if(!socket.usersByRooms){
      callback({'error': 'retry getting player'});

    }
    else{
      console.log(socket.usersByRooms["currentplayer"])
      callback({
        response:socket.usersByRooms["currentplayer"]
      });
    }
    
  });

  socket.on("joingame", (room,clientID,playerID,callback) => {
    if(playerID){
    console.log([playerID,clientID,"has joined"])
    socket.join(room);
    socket.usersByRooms[playerID]=clientID
    socket.usersByRooms["playerID"]=playerID
    socket.emit("setdata",playerID,BoardMax,[... PLAYER1_PIECES.keys()],[...PLAYER2_PIECES.keys()],squaresCount,sideborder)
  }

  else if(! socket.usersByRooms["player1"]){
    console.log(["player1",clientID,"has joined"])
    socket.join(room);
    socket.usersByRooms["player1"]=clientID
    socket.usersByRooms["playerID"]="player1"
    socket.emit("setdata","player1",BoardMax,[... PLAYER1_PIECES.keys()],[...PLAYER2_PIECES.keys()],squaresCount,sideborder)
  }


  else if(! socket.usersByRooms["player2"]){
    console.log(["player2",clientID,"has joined"])
    socket.join(room);
    socket.usersByRooms["player2"]=clientID
    socket.usersByRooms["playerID"]="player2"
    socket.emit("setdata","player2",BoardMax,[... PLAYER1_PIECES.keys()],[...PLAYER2_PIECES.keys()],squaresCount,sideborder)
  }



  console.log(socket.usersByRooms)

  callback({
   response: "ok"
  });

  });

  socket.on("startgame", (callback) => {
    socket.usersByRooms["ready"]= socket.usersByRooms["ready"]+1
    console.log(["ready to start game",socket.usersByRooms["ready"]])

    if( socket.usersByRooms["ready"]==2){
      socket.usersByRooms["ready"]=0
      socket.usersByRooms["currentplayer"]="player1"
      socket.usersByRooms["otherplayer"]="player2"

      io.emit("startgame")
    }

    callback({
      response: "ok"
     });

  })


  socket.on('disconnect', () => {
    console.log('user disconnected reseting room');
    if(socket.usersByRooms){
      usersByRooms[socket.usersByRooms["room"]]=null
    }
    io.emit("destroy")
    
  });
});

io.of("/").adapter.on("create-room", (room) => {
  console.log(`room ${room} was created`);
});

io.of("/").adapter.on("join-room", (room, id) => {
  console.log(`socket ${id} has joined room ${room}`);
});








const port= process.env.SERVER_PORT

httpServer.listen(port, function () {
    console.log('Server started! on port',port)
});
