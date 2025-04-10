const http = require("http");
const https = require("https");
const fs = require("fs");
const { game, join, validateMove, processMove,  getcurrentPlayer, interactiveHelper } = require("./controllers.js");
require('dotenv').config(".env");

const { Server } = require("socket.io");
const url = require('url');
const base64id = require('base64id');

const privateKeyEnv = process.env.PRIVATE_KEY;
const certificateEnv = process.env.CERT_KEY;

let server;

if (privateKeyEnv && certificateEnv) {
  const credentials = {
    key: privateKeyEnv,
    cert: certificateEnv
  };
  server = https.createServer(credentials);
  console.log("Starting secure Socket.IO server (HTTPS)");
} else {
  server = http.createServer();
  console.log("Starting insecure Socket.IO server (HTTP)");
}

const io = new Server(server, {
  cors: {
    origin: /.*/,
    methods: ["GET", "POST"],
  }
});
io.set('transports', ['websocket']);

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
    if (!validateMove(socket,io,startdex,endex)){
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


const port= process.env.SOCKET_IO_PORT || 7500

server.listen(port, function () {
    console.log('Socket.io Server started! on port',port)
});
