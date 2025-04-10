
import { socket,emit,gameID, setPlayerNumber, setGameData,setSocketID,setLocalPlayerStatus} from "./client.js";
import preload from "../scenes/board.js";

let game =null;
(()=>{
  //remove all listeners that may be present
 

  socket.on("connect", () => {
  setSocketID(socket.id)
  emit("creategame",gameID);
    document.querySelector("#alertBar").textContent="waiting on other player"
  }
  
  );

  socket.on("disconnect", () => {
    window.location.reload();
  }
  
  );


  socket.on("full", () => {
  window.location.href = `/full`;

  }

  
  );

  socket.on("creategame", () => {
    console.log("creategame")

  emit("creategame",gameID);
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
    setLocalPlayerStatus(player)

  })

async function startgame(){

    //set current player
    document.querySelector("#alertBar").textContent=`waiting on server`

    if(game!=null){
      game.scene.remove('preload');

      game.scene.add('preload', preload,true);

      return
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
        game.scene.add('preload', preload,true);
  
    })()

  }})()

















