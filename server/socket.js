const httpServer= require("http").createServer();
const {addGameList,getGame, updateGame}= require("./redis.js")
const {BoardMax,squaresCount,sideborder}=require("../res/player.js")
const path = require('path');
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
    socket.ready=false
  });

//join game
  let join=(async()=>{
    let player=null
    console.log(socket.userRoom)

    if(socket.userRoom['player1']==socket.id){
      player="player1"
      console.log(["player1",socket.id,"has joined",room])
      socket.join(room);
      socket.playerID=socket.id
      socket.otherplayer="player2"
      socket.usersByRoom=await updateGame(room,{
        "player1":socket.id
      })
    }
    else if(socket.userRoom['player2']==socket.id){
      player="player2"
      console.log(["player2",socket.id,"has joined",room])
      socket.join(room);
      socket.playerID=socket.id
      socket.otherplayer="player1"
      socket.usersByRoom=await updateGame(room,  {
        "player2":socket.id
      })
    }

  
    else if(! socket.userRoom["player1"]){
      player="player1"
      console.log(["player1",socket.id,"has joined",room])
      socket.join(room);
      socket.playerID=socket.id
      socket.otherplayer="player2"
      socket.usersByRoom=await updateGame(room,
      {
        "player1":socket.id
      }
      )
    }
  
  
    else if(! socket.userRoom["player2"]){
      player="player2"
      console.log(["player2",socket.id,"has joined",room])
      socket.join(room);
      socket.playerID=socket.id
      socket.otherplayer="player1"

      socket.usersByRoom=await updateGame(room,  {
      "player2":socket.id
    })
    } 
    else{
      return
    }

    socket.emit("setdata",player,BoardMax,socket.userRoom["player1Pieces"],socket.userRoom["player2Pieces"],squaresCount,sideborder)

  
    console.log(['current room join',socket.userRoom]);


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
      callback({
        response: "ok"
      });
    }
    else{
      let game=await getGame(socket.room)
      socket.userRoom=await updateGame(socket.room,{"moves":game["moves"]+1,"currentplayer":null,"currentid":null})
      io.to(socket.userRoom[socket.otherplayer]).emit("sendmove",startdex,endex);
      callback({
        response: "ok"
      });
    }
   
  })






  socket.on("getcurrentplayer", (callback) => {
    console.log(`getting player`)

    if(!socket.userRoom){
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

    socket.ready=true
    console.log(["ready to set interactive",socket.room,socket.userRoom!=null])
    let sockets=await io.in(socket.room).fetchSockets()
    sockets.forEach((e,i)=>{
      console.log(["ready status",`${i+1}/${sockets.length}`,e.id,e.ready])
    })
    if(!socket.userRoom){
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
      io.to(socket.userRoom["currentid"]).emit("enableinteractive");
      io.to(socket.userRoom["otherid"]).emit("disableinteractive");
      //send player indicator
      sockets.forEach(e=>e.emit("setplayerindicator",socket.userRoom["currentplayer"]))
      callback({
        response: "ok"
       });
       sockets.forEach(e=>e.ready=false)
    }
  



  })




  socket.on('disconnect', async () => {
    console.log('user disconnected saving room');
    //some changes for without redux
    if(socket.usersByRoom){
      temp={}
      temp[socket.playerID]=null
      temp["moves"]=0
      await updateGame(socket.room,temp)
    }
    (await io.in(socket.room).fetchSockets()).forEach(e=>e.emit("creategame"))

  });
});

// io.of("/").adapter.on("create-room", (room) => {
//   console.log(`room ${room} was created`);
// });

// io.of("/").adapter.on("join-room", (room, id) => {
//   console.log(`socket ${id} has joined room ${room}`);
// });








const port= process.env.SERVER_PORT

httpServer.listen(port, function () {
    console.log('Server started! on port',port)
});
