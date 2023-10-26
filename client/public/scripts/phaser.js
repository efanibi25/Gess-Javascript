
import { socket,gameID,getPlayerNumber, setPlayerNumber,emit} from "./client.js";
(()=>{
  


  socket.on("connect", () => {

    emit(socket,"joingame",gameID,socket.id,getPlayerNumber());
  
  });


  socket.on("setplayer", (str) => {
    setPlayerNumber(str);
    //start game after setting player
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

  
  const game = new Phaser.Game(config);
  const url=window.location.origin;
  const key=document.getElementById('key').textContent
  game.scene.add('preload', preload);
  game.scene.start('preload')
  
    })()

  });
  
  
})()
















