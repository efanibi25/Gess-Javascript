

import gessBoard from "../classes/board.js"
import { getPlayerNumber ,getCurrentPlayer,emit,socket,data} from "../scripts/client.js";
export default class preload extends Phaser.Scene {


preload() {
    let image = new Image();
    let url="../assets/wood.jpg"
image.src = url
    this.load.image('background', url );
}


create() {
    //cleanup
    this.events.on('destroy',()=>
    {
        socket.removeAllListeners("enableinteractive");
        socket.removeAllListeners("disableinteractive");
        socket.removeAllListeners("sendmove");
        socket.removeAllListeners("restboard");
        this.input.removeListener("drag")
        this.input.removeListener("dragend")
        this.input.removeListener("drop")
        document.querySelector("#plus-button").removeEventListener("click",this.handleplus)
        document.querySelector("#minus-button").removeEventListener("click",this.handleminus)
        this.gessBoard.board.forEach((e)=>{
            e.piece.removeAllListeners()
            e.piece=null
            e.zone!=null? e.zone.removeAllListeners():null 
            e.zone=null
            e.removeAllListeners()
            e=null
        })
        this.gessBoard=null




    

        })

    this.add.image(0, 0, 'background');
    this.gessBoard=new gessBoard(this,getPlayerNumber())
    document.querySelector("#playerindicator").children[1].textContent =`Color: ${this.gessBoard.color}`
    this.gessBoard.create()
    this.input.dragTimeThreshold = 100;
    this.gameHeight=85

    //check if player should have control
    this.events.once('preupdate', function() {
        emit("gamestate")
    });

socket.on("winner", (player) => {
    document.querySelector("#alertBar").textContent=`${player} has won the game`
})

    

    socket.on("sendalert", (message) => {
        document.querySelector("#alertBar").textContent=message
        setTimeout(async()=>document.querySelector("#alertBar").textContent= document.querySelector("#alertBar").textContent=data["playerstatus"], 4000);  
       
    })
socket.on("sendmove", (startdex,endex,test=true) => {
    //scene resets
    this.gessBoard.scene=this
   this.gessBoard.movePieceAuto(startdex,endex)
   if (test){
    emit("gamestate")
    emit("checkrings",endex)
   }
})


socket.on("enableinteractive", () => {
    //scene resets
    console.log("disable previously enabled")
    this.input.removeListener("drag")
    this.input.removeListener("dragend")
    this.input.removeListener("drop")
    console.log("enable interactive")


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


this.input.addListener('drag',dragfunct)





    this.input.addListener('dragend', async(pointer, gameObject, dropped) =>
    {

        //disable listeners
        this.input.removeListener("drag")
        this.input.removeListener("dragend")
        this.input.removeListener("drop")
        this.gessBoard.getDraggablePieces().forEach(
            e=>e.allowDraggable()
    )


        let currentplayer=await getCurrentPlayer(true)
        let playeNumber=getPlayerNumber()
        
        if(currentplayer!=playeNumber){
            gameObject.revertNeighbors()
            gameObject.hideNeighbors() 
            document.querySelector("#alertBar").textContent=`It is not ${playeNumber}'s turn`
            setTimeout(async()=>document.querySelector("#alertBar").textContent=data["playerstatus"], 4000);  
        }
        
        else if (!dropped)
        {
            gameObject.revertNeighbors()
            gameObject.hideNeighbors()

            this.input.addListener("drag",dragfunct)

        }
        else{
            emit("sendmove",gameObject.block.index,gameObject.newBlock.index)

            this.gessBoard.movePieceAuto(gameObject.index,gameObject.index)
            gameObject.hideNeighbors() 
            this.events.emit('updatePiece');
    
        }
        

        gameObject.normalSize()
        gameObject.block.zone.removeZoneLine()

      

       
        

    });

    this.input.addListener('drop', (pointer, gameObject, dropZone) =>
    {

        gameObject.x = dropZone.x;
        gameObject.y = dropZone.y;
        gameObject.setNewBlock(dropZone.block)
        dropZone. removeZoneLine()

    })

    this.gessBoard.getDraggablePieces().forEach(
        e=>e.allowDraggable()
        )
})

socket.on("disableinteractive", () => {
    console.log("disable interactivety")

    this.input.removeListener("drag")
    this.input.removeListener("dragend")
    this.input.removeListener("drop")
    this.gessBoard.getDraggablePieces().filter(e=>e.draggable==true).forEach(e=>e.disableDraggable())
})


this.handleplus=function() {
    this.gameHeight=this.gameHeight*1.1
    document.querySelector("#game").style.height=`${this.gameHeight}vh`
}.bind(this)
this.handleminus=function() {
    this.gameHeight=this.gameHeight/1.1
    document.querySelector("#game").style.height=`${this.gameHeight}vh`

}.bind(this)

document.querySelector("#plus-button").addEventListener("click", this.handleplus);

document.querySelector("#minus-button").addEventListener("click", this.handleminus);

    
 













}
  
update(){
  }

}