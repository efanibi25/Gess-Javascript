

import gessBoard from "../classes/board.js"
import { getPlayerNumber ,getCurrentPlayer,emit,socket, setCurrentPlayerIndicator,gameID} from "../scripts/client.js";
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
            console.log(e.zone)
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


    this.events.once('preupdate', function() {
        emit("toggleinteractive")
    });
    

socket.on("sendmove", (startdex,endex) => {
    //scene resets
    this.gessBoard.scene=this
   this.gessBoard.movePieceAuto(startdex,endex)
   emit("toggleinteractive")
})

socket.on("restartboard", () => {
    if(this.gessBoard){
        this.gessBoard.destroy()
    }
    this.gessBoard.create()
    
})


socket.on("enableinteractive", () => {
    //scene resets
    console.log("enable interactivety")


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

            this.input.addListener("drag",dragfunct)

        }
        else if ( gameObject.testValidBlock()==false || gameObject.testValidBlockMove()==false){

            gameObject.revertNeighbors()
            gameObject.hideNeighbors()
            this.input.addListener("drag",dragfunct)


        }
        
        else{

            gameObject.movePiece()
            this.events.emit('updatePiece');
            this.gessBoard.checkRings(gameObject.getRingNeighbors())
            gameObject.hideNeighbors()
            emit("sendmove",gameObject.block.index,gameObject.newBlock.index)
            emit("toggleinteractive")




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
    this.gessBoard.getDraggablePieces().filter(e=>e.InteractiveObject!=null).forEach(e=>e.removeInteractive())
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


// this.events.addListener("destroy",()=>{

//     console.log("remaking game")
//     emit("creategame",gameID);
//     document.querySelector("#alertBar").textContent="created game"
//     Array.from(document.querySelector("#game").children).forEach(e=>{e.remove()})
    
// })

    
    

;












}
  


ready(){
    emit("toggleinteractive")
}
destroy(){
    console.log("dadad")
}

update(){
  }

}