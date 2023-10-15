//  express = require('express')
// var app = express()
// var server = require('http').Server(app)
const server = require("http").createServer();
export const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"],
  }
});



players = new Map();
gameKeys = new Map();
players.set('Player1',0)
players.set('Player2',0)
io.on('connection', function (socket) {
  console.log("A user connected:",socket.id)
  socket.join('gessgame')


  if(io.sockets.adapter.rooms.get('gessgame').length>2){
    console.log("This Game Already has two Players")
    socket.leave('gessgame');
    return
  }
      socket.on('disconnect', function () {
      socket.leave(socket.id)
      if(players.get('Player1')==socket.id)
       {

     players.set('Player1',0)
     console.log('Player1 Disconnected')

       }

       else
       {
    	players.set('Player2',0)
       	console.log('Player2 Disconnected')
       }


  });





//save game state some how probably after a drag movement
//set which player is current player etc



//First Player to connect is always player A

  socket.on('checkNewGame', function (gameKey) {
    gameKeys.set(socket.id,gameKey)
    if (io.sockets.adapter.rooms.get('gessgame').length<2){
      console.log("Waiting For Other Player")
      return
    }
    //Add First Player
    var dictkeys= io.sockets.adapter.rooms.get('gessgame').keys()
    for (keys in dictkeys){
      var key1=keys[0]
    }

    if(gameKeys.get(key1)==0 || gameKeys.get(key2)==0){
      console.log("starting a new Game")
      io.to(key1).emit('selectPlayer')
      return
    }
    if(gameKeys.get(key1)==gameKeys.get(key2)){
      console.log("Restore Your old Game")
    }


  });

   socket.on('addSecondPlayer', function () {
     var dictkeys= io.sockets.adapter.rooms.get('gessgame').keys()
     for (keys in dictkeys){
       var key1=keys[0]
        var key2=keys[1]
      }
        var player1=players.get('Player1')
        var player2=players.get('Player2')
        console.log('Setting Player 2:' ,key2)
        if(player1!=0){
        players.set('Player2',socket.id)
        io.to(key2).emit('isPlayer2',true)
        return
        }
        if(player2!=0){
        players.set('Player1',socket.id)
        io.to(key2).emit('isPlayer1',true)
        return
        }

    });

 socket.on('ObjectDrag', function (dragX,dragY) {
        io.emit('ObjectDrag',dragX,dragY);
    });

 socket.on('addFirstPlayer', function (isPlayer1) {
    if (isPlayer1=="true") {
        socket.emit('isPlayer1',true);
        players.set('Player1',socket.id)
        console.log('Setting Player 1:' ,socket.id)
        return

    };

     if (isPlayer1=="false") {
        socket.emit('isPlayer2',true);
         players.set('Player2',socket.id)
        console.log('Setting Player 2:' ,socket.id)
        return

    };


  })


   socket.on('CheckPlayer', function (result) {
    console.log("result",result)
    if(result.isConfirmed && players.get('Player1')!=0)
    {
      return
    }
    if(result.isDenied && players.get('Player2')!=0)
    {
      return

    }
    else
    {
      socket.emit('CheckPlayer',1)
    }







    });

})


const port= process.env.PORT || 7000

server.listen(port, function () {
    console.log('Server started! on port',port)
});
