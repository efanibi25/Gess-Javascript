
import { socket,emit,gameID,getPlayerNumber, setPlayerNumber, setCurrentPlayerIndicator, setGameData} from "./client.js";
import preload from "../scenes/board.js";

let game =null;
(()=>{
  //prevent double board glitch
  

  socket.on("connect", () => {
    console.log("creategame")

  emit("creategame",gameID,socket.id,getPlayerNumber());
    document.querySelector("#alertBar").textContent="waiting on other player"

  }
  
  );


  socket.on("creategame", () => {
    console.log("creategame")

  emit("creategame",gameID,socket.id,getPlayerNumber());
    document.querySelector("#alertBar").textContent="waiting on other player"

  }
  
  );





  socket.on("setdata", async (...data) => {

    let [playernum,BoardMax,PLAYER1_PIECES,PLAYER2_PIECES,squaresCount,sideborder]=data
    setPlayerNumber(playernum);
    setGameData("Boardmax",BoardMax)
    setGameData("PLAYER1_PIECES",new Set(PLAYER1_PIECES))
    setGameData("PLAYER2_PIECES",new Set(PLAYER2_PIECES))
    setGameData("squaresCount",squaresCount)
    setGameData("sideborder",sideborder)

    //start game after setting player
    document.querySelector("#playerindicator").children[0].textContent=playernum.charAt(0).toUpperCase() + playernum.slice(1);
    await startgame()  
  })


  socket.on("setplayerindicator", (player) => {
    document.querySelector("#alertBar").textContent=`It is currently ${player} turn`
  })

async function startgame(){

    //set current player
    document.querySelector("#alertBar").textContent=`waiting on server`

    if(game){
      game.destroy()
      game=null
      Array.from(document.querySelector("#game").children).forEach((e)=>e.remove())
    }
   
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

  }})()

















