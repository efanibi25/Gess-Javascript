const httpServer= require("http").createServer();
const {game,join,validateMove,processMove,getcurrentPlayer,interactiveHelper}=require("./controllers.js")
require('dotenv').config(".env")

const { Server } = require("socket.io");
const url = require('url')
const base64id = require('base64id');
const e = require("express");






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

  await game(socket,room)
  await join(socket,room)
  
  callback({
    response: "ok"
  });
  })


  socket.on("sendmove", async (startdex,endex,callback) => {
    if (!validateMove(socket,startdex,endex)){
      callback({
        response: "ok"
      });
    }

    else{
      await processMove(socket,io,startdex,endex)

      callback({
        response: "ok"
      });    

    }
   
  })



  socket.on("getcurrentplayer", async(forced,callback) => {
    console.log(`getting player`)
    let player=await getcurrentPlayer(socket,forced)
    callback({
      response:player
    });
    
  });


  socket.on("gamestate", async(callback) => {
    console.log(["ready to set interactive",socket.room,socket.userRoom!=null])
    interactiveHelper(socket,io)
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


const port= process.env.SOCKET_IO_PORT

httpServer.listen(port, function () {
    console.log('Socket.io Server started! on port',port)
});
