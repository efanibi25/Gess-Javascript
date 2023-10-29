
import { socket,emit,gameID,getPlayerNumber, setPlayerNumber, setCurrentPlayerIndicator, setGameData} from "./client.js";
import preload from "../scenes/board.js";

let game =null;

(()=>{
  //prevent double board glitch
  

  socket.on("connect", () => {
    emit("creategame",gameID);
    document.querySelector("#alertBar").textContent="created game"

  }
  
  );


  socket.on("joingame", () => {
    emit("joingame",gameID,socket.id,getPlayerNumber());
    document.querySelector("#alertBar").textContent="waiting on other player"
  });




  socket.on("setdata", (...data) => {

    let [playernum,BoardMax,PLAYER1_PIECES,PLAYER2_PIECES,squaresCount,sideborder]=data
    setPlayerNumber(playernum);
    setGameData("Boardmax",BoardMax)
    setGameData("PLAYER1_PIECES",new Set(PLAYER1_PIECES))
    setGameData("PLAYER2_PIECES",new Set(PLAYER2_PIECES))
    setGameData("squaresCount",squaresCount)
    setGameData("sideborder",sideborder)

    //start game after setting player
    document.querySelector("#playerindicator").children[0].textContent=playernum.charAt(0).toUpperCase() + playernum.slice(1);
    emit("startgame")
  
  })


  socket.on("setplayerindicator", (player) => {
    document.querySelector("#alertBar").textContent=`It is currently ${player} turn`

  })

  socket.on("startgame",async ()=>{

    //set current player
    await setCurrentPlayerIndicator();
   
    (()=>{
      const config = {
        type: Phaser.AUTO,
        width: screen.width,
        height: screen.height,
        transparent:true,
        expandParent: false,
        parent:"game",
        scale: {
          mode: Phaser.Scale.ScaleModes.FIT,
          // autoCenter: Phaser.Scale.Center.CENTER_BOTH
        },
      };

        game = new Phaser.Game(config);
        game.scene.add('preload', preload);
        game.scene.start('preload')

      
  

  
    })()

  });
  
  
})()
















