
import preload from "../scenes/board.js";
(()=>{
  const config = {
    type: Phaser.AUTO,
    width: screen.width,
    height: screen.height,
    transparent:true,
    scale: {
      mode: Phaser.Scale.ScaleModes.FIT,
      autoCenter: Phaser.Scale.Center.CENTER_BOTH
    },
  };
  
  const game = new Phaser.Game(config);
  const url=window.location.origin;
  const key=document.getElementById('key').textContent
  game.scene.add('preload', preload);
  game.scene.start('preload')
  

  
})()

   // function temp(){
    //   // var gameboard=new gess.Board(current)
    //   console.log("ddd")
    // }
  

// function preload() {
//   this.load.setPath("assets")
//   let wood="wood.jpg";
//   this.load.image("wood", `${window.location.origin}/assets/${wood}`);
 
//   // link="httlp://localhost:8080/database/"+key
//   temp()

//     }
  
// function create() {
//   var current=this
//   // async function getTable() {
//   // req = await fetch(link);
//   // const reqtext= await req.text()
//   // data=JSON.parse = (reqtext)
//   // let loadBackgroundBind=loadBackground.bind(current)
//   // let setGameBind=setGame.bind(current)
//   loadBackgroundBind()
//   setGameBind()

  
// }

// function loadBackground(){
//   this.add.image(400, 300, 'wood');
// }


// function setGame(){
//   let board=new Board(this.scene,this)
//   board.create_board()
// }



// getTable()
  // current.socket = io('http://localhost:3000/')
  // this.add.image(500, 500, "wood");
  // this.gameKey=localStorage.getItem('gameKey222')|| 0;
  // current.socket.emit('checkNewGame',current.gameKey)






//    current.socket.on('loadGame', function (dragX,dragY) {
//   current.socket.emit('setupPlayer',current.isPlayer1);
//         })
//   //load game mabe check somehow if other player has the same game will probably use a random code
//    current.socket.on('selectPlayer', function () {
//       Swal.fire({
//       title: 'Pick A Color',
//       showDenyButton: true,
//       showCancelButton: true,
//       confirmButtonText: `White`,
//       denyButtonText: `Black`,
//       }).then((result) => {
//       /* Read more about isConfirmed, isDenied below */
//       if (result.isConfirmed) {
//         current.isPlayer1="true"
//         current.socket.emit('addFirstPlayer',current.isPlayer1)
//       }
//       else if (result.isDenied) {
//         current.isPlayer1="false"
//         current.socket.emit('addFirstPlayer',current.isPlayer1)
//       }
//       current.socket.emit('addSecondPlayer')
//
//     })
//     })
//
//
//
//
//
//
//
//
//
//
//  //Phaser Events
//   this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
//     //  if (current.isPlayer1 ==false)
//     // {
//     //   //   Swal.fire({
//     //   //   title: 'Not Your Turn',
//     //   //   text:"You can not move",
//     //   //   icon: 'info',
//     //   //   confirmButtonText: 'Close'
//     //   // })
//     // // return
//     // }
//
//     gameObject.x = dragX;
//     gameObject.y = dragY;
//     // current.socket.emit('ObjectDrag',dragX,dragY);
//
//     });
//
//
//
//
//
// //add keyboard shortcut to set player, will probably have to send to other player
//
//
//
//
//
// //Socket Communinications
//
//   this.socket.on('ObjectDrag', function (dragX,dragY) {
//               logo.x = dragX;
//               logo.y = dragY;
//         })
//   this.socket.on('Waiting',function(){
//         Swal.fire({
//         title: 'Waiting for Player2!',
//         text: 'Have Another Player Connect to this Room',
//         icon: 'info',
//         confirmButtonText: 'Close'
//       })
//
//         })
//
//   this.socket.on('connect', function () {
//     console.log('Connected!');
//     });
//   this.socket.on('isPlayer1', function (newgame) {
//     localStorage.setItem("isPlayer1", JSON.stringify(current.isPlayer1));
//     console.log("Player1 Connected")
//     current.isPlayer1="true"
//     var gameboard=new gess.Board(current)
//     if(newgame==false){
//       var player1array= localStorage.getItem('board122')|| 0;
//       var player2array= localStorage.getItem('board2222')|| 0;
//     }
//
//     else{
//       player1array="0000000000000000000000101011111111010100011101011110101011100010101111111101010000000000000000000000000000000000000000000010010010010010010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
//
//       player2array="00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100100100100100100000000000000000000000000000000000000000000101011111111010100011101011110101011100010101111111101010000000000000000000000";
//
//     }
//     var color1=0xFFFFFF
//     var color2=0x000000
//     var player1board = new BitSet(player1array);
//     var player2board = new BitSet(player2array);
//     gameboard.create_board(player1board,player2board,color1,color2)
//
//   })
//
// //Find out why colors are switching
//
//
//   this.socket.on('isPlayer2', function (newgame) {
//     console.log("Player2 Connected")
//     current.isPlayer1="false"
//     var gameboard=new gess.Board(current)
//     if(newgame==false){
//       var player1array= localStorage.getItem('board1222')|| 0;
//       var player2array= localStorage.getItem('board2222')|| 0;
//     }
//     else{
//       player1array="00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100100100100100100000000000000000000000000000000000000000000101011111111010100011101011110101011100010101111111101010000000000000000000000";
//
//       player2array="0000000000000000000000101011111111010100011101011110101011100010101111111101010000000000000000000000000000000000000000000010010010010010010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
//     localStorage.setItem("isPlayer1", JSON.stringify(current.isPlayer1));
//     }
//     var color1=0x000000
//     var color2=0xFFFFFF
//     var player1board = new BitSet(player1array);
//     var player2board = new BitSet(player2array);
//     gameboard.create_board(player1board,player2board,color1,color2)
//         })















