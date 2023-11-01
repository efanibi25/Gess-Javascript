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
  socket.on("creategame", (room,clientID,playerID,callback) => {
  (()=>{
    if(!usersByRooms[room]){                                
      usersByRooms[room]={
        "player1":null,
        "player2":null,
        "currentplayer":null,
        "moves":null,
  }
    }
  
    socket.room=room;
    socket.usersByRooms=usersByRooms[room];
    console.log(`current room ${JSON.stringify(usersByRooms[room])}`);

  })();

//join game
  (()=>{

    if(playerID){
      console.log([playerID,clientID,"has joined",room])
      socket.join(room);
      socket.usersByRooms[playerID]=clientID
      socket.usersByRooms["playerID"]=playerID

      socket.emit("setdata",playerID,BoardMax,[... PLAYER1_PIECES.keys()],[...PLAYER2_PIECES.keys()],squaresCount,sideborder)
    }
  
    else if(! socket.usersByRooms["player1"]){
      console.log(["player1",clientID,"has joined",room])
      socket.join(room);
      socket.usersByRooms["player1"]=clientID
      socket.playerID="player1"
      socket.otherID="player2",
      socket.emit("setdata","player1",BoardMax,[... PLAYER1_PIECES.keys()],[...PLAYER2_PIECES.keys()],squaresCount,sideborder)
    }
  
  
    else if(! socket.usersByRooms["player2"]){
      console.log(["player2",clientID,"has joined",room])
      socket.join(room);
      socket.usersByRooms["player2"]=clientID
      socket.playerID="player2"
      socket.otherID="player1"

      socket.emit("setdata","player2",BoardMax,[... PLAYER1_PIECES.keys()],[...PLAYER2_PIECES.keys()],squaresCount,sideborder)
    }  
  
    console.log(socket.usersByRooms)


  })()
  

  callback({
    response: "ok"
  });
  })



  socket.on("sendmove", (startdex,endex,callback) => {
    socket.usersByRooms["currentplayer"]=null
    socket.usersByRooms["moves"]=socket.usersByRooms["moves"]+1
    io.to(socket.usersByRooms[socket.usersByRooms["otherplayer"]]).emit("sendmove",startdex,endex);
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
      console.log(["current player",socket.usersByRooms["currentplayer"]])
      callback({
        response:socket.usersByRooms["currentplayer"]
      });
    }
    
  });



 
  socket.on("toggleinteractive", async(callback) => {

    socket.ready=true
    console.log(["ready to set interactive",socket.room,socket.usersByRooms!=null])
    let sockets=await io.in(socket.room).fetchSockets()
    sockets.forEach((e,i)=>{
      console.log(["ready status",`${i+1}/${sockets.length}`,e.id,e.ready])
    })
    if(!socket.usersByRooms){
      callback({
        response: "ok"
       });
       return
    
    }
    else if(sockets.filter(e=>e.ready==true).length!=2){
      callback({
        response: "ok"
       });
       return
    }


    else{
      console.log(["setting interactive",socket.usersByRooms])
      //switch player
      if(socket.usersByRooms["moves"]%2==0){
        socket.usersByRooms["currentplayer"]="player1"
        socket.usersByRooms["otherplayer"]="player2"
       }
       else{
        socket.usersByRooms["currentplayer"]="player2"
        socket.usersByRooms["otherplayer"]="player1"
       }
      console.log(["after switch",socket.usersByRooms])


      //toggle interactive
      io.to(socket.usersByRooms[socket.usersByRooms["currentplayer"]]).emit("enableinteractive");
      io.to(socket.usersByRooms[socket.usersByRooms["otherplayer"]]).emit("disableinteractive");
      //send player indicator
      sockets.forEach(e=>e.emit("setplayerindicator",socket.usersByRooms["currentplayer"]))
      callback({
        response: "ok"
       });
       sockets.forEach(e=>e.ready=false)
    }
  



  })




  socket.on('disconnect', async () => {
    console.log('user disconnected reseting room');
    //some changes for without redux
    if(socket.usersByRooms){
      socket.usersByRooms[socket["playerID"]]=null
      socket.usersByRooms["moves"]=0
    }
    // (await io.in(socket.room).fetchSockets()).forEach(e=>e.emit("toggleinteractive"))
    (await io.in(socket.room).fetchSockets()).forEach(e=>e.emit("creategame"))

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
