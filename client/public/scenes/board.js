

import gessBoard from "../classes/board.js"
import { getPlayerNumber ,getCurrentPlayer,emit,socket, setCurrentPlayerIndicator,gameID} from "../scripts/client.js";
export default class preload extends Phaser.Scene {


preload() {
    let image = new Image();
    let url="../assets/wood.jpg"
image.src = url
    this.load.image('background', url );
    this.canvas = this.sys.game.canvas;
}


create() {
    this.add.image(0, 0, 'background');
    this.gessBoard=new gessBoard(this,getPlayerNumber())
    document.querySelector("#playerindicator").children[1].textContent =`Color: ${this.gessBoard.color}`

    this.gessBoard.create()
    this.input.dragTimeThreshold = 100;
    this.gameHeight=85

    socket.on("destroy", () => {

        try{
            console.log("destroying game")
       this.game.destroy(true)    
        }
        catch(e){
            this.events.emit("destroy")

        }
        
      })


socket.on("sendmove", (startdex,endex) => {
    //scene resets
    this.gessBoard.scene=this
   this.gessBoard.movePieceAuto(startdex,endex)
   emit("switchplayer")
})

this.events.addListener("destroy",()=>{

    console.log("remaking game")
    emit("creategame",gameID);
    document.querySelector("#alertBar").textContent="created game"
})

    
    

    document.querySelector("#plus-button").addEventListener("click", (function() {
        this.gameHeight=this.gameHeight*1.1
        document.querySelector("#game").style.height=`${this.gameHeight}vh`
    }).bind(this));


    document.querySelector("#minus-button").addEventListener("click", (function() {
        this.gameHeight=this.gameHeight/1.1
        document.querySelector("#game").style.height=`${this.gameHeight}vh`


    }).bind(this));
    this.input.on('drop', (pointer, gameObject, dropZone) =>
    {

        gameObject.x = dropZone.x;
        gameObject.y = dropZone.y;
        gameObject.setNewBlock(dropZone.block)
        dropZone. removeZoneLine()

    });









const dragfunct= (event, gameObject) =>
{


    let difX=event.position.x-gameObject.x
    let difY=event.position.y-gameObject.y
    gameObject.getNeighbors()
    Object.values(gameObject.neighbors).filter(e=>e!=null).forEach(ele=>{
        ele.x = ele.x+difX;
        ele.y = ele.y+difY;
    })


}


this.input.on('drag',dragfunct)





    this.input.on('dragend', async(pointer, gameObject, dropped) =>
    {

        this.input.removeListener("drag")
        let currentplayer=await getCurrentPlayer()
        let playeNumber=getPlayerNumber()
        if(currentplayer!=playeNumber){
            gameObject.revertNeighbors()
            gameObject.hideNeighbors() 
            document.querySelector("#alertBar").textContent=`It is not ${playeNumber}'s turn`
            setTimeout(async()=>document.querySelector("#alertBar").textContent=await setCurrentPlayerIndicator(), 4000);  
        }
        
        else if (!dropped)
        {
            gameObject.revertNeighbors()
            gameObject.hideNeighbors()

        }
        else if ( gameObject.testValidBlock()==false || gameObject.testValidBlockMove()==false){

            gameObject.revertNeighbors()
            gameObject.hideNeighbors()

        }
        
        else{

            gameObject.movePiece()
            this.events.emit('updatePiece');
            this.gessBoard.checkRings(gameObject.getRingNeighbors())
            gameObject.hideNeighbors()
            emit("sendmove",gameObject.block.index,gameObject.newBlock.index)



        }
        this.input.addListener("drag",dragfunct)
        gameObject.normalSize()
        gameObject.block.zone.removeZoneLine()

      

       
        

    });



}
  



  update(){
  }

}