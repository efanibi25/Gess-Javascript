const httpServer= require("http").createServer();
require('dotenv').config({ path: '../.env' })
const { Server } = require("socket.io");
const url = require('url')
const base64id = require('base64id');
const { call } = require("file-loader");



const usersByRooms = {}
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
  console.log('a user connected');

  socket.on("joingame", (room,clientID,playerID,callback) => {
    console.log(callback)
    // console.log(clientID)
    // console.log(playerID)
 
    if (usersByRooms[room] == undefined) {
      usersByRooms[room]={
        "player1":null,
        "player2":null} 
  } 

  if(playerID){
    socket.join(room);
    usersByRooms[room][playerID]=clientID
    socket.emit("setplayer",playerID)
  }
  else if(!usersByRooms[room]["player1"]){
    socket.join(room);
    usersByRooms[room]["player1"]=clientID
    socket.emit("setplayer","player1")
  }


  else if(!usersByRooms[room]["player2"]){
    socket.join(room);
    usersByRooms[room]["player2"]=clientID
    socket.emit("setplayer","player2")

  }

  
  else {
   console.log("game has two players")
  }

  console.log(usersByRooms)
  callback({
    status: "ok"
  });

  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
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
