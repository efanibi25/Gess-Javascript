
/*
Piece Libary
Note: Piece never change location only attributes based on grab events and validation of moves

*/
import { data } from "../../scripts/lib/network.js"


const lineThick=3
const lineColor=0xFF0000
const checkValidMove=true
const checkValidBlock=true
const showHidden=false
//alpha 0 disables interactivity
const hiddenAlpha=.01
const showAlpha=.5
const alertTimeout=2000
export default class boardPiece extends Phaser.GameObjects. Arc {

    constructor(scene,x=0,y=0,radius=50,index,block){
        super(scene, x, y,radius=Math.max(radius,7))
        this._radius=this.radius
        this.ogwidth=this.width
        this.neighborsDexes=[0,-1,1,-data["squaresCount"]-data["sideborder"],
        data["squaresCount"]+data["sideborder"],data["squaresCount"]+
        data["sideborder"]+1,-data["squaresCount"]-data["sideborder"]-1,
        data["squaresCount"]+data["sideborder"]-1,-data["squaresCount"]-
        data["sideborder"]+1]
        
        this.on('pointerdown', this.handlePointerDown)
        this.on('pointerup', this.handlePointerUp)
        this.addListener('dragstart', this.startDrag);
        this.addListener("dragenter",this.enterTarget)
        this.addListener("dragleave",this.leaveTarget)
        this.scene.events.addListener('updatePiece', this.updatePiece,this);
        
        this.owner=null
        this.index=index
        this.block=block
        this.newBlock=null
        this.neighbors=null
        this.prevOwner=null
        this.gamePiece=true

    }



    allowDraggable(){
        this.setInteractive( new Phaser.Geom.Rectangle(0 ,0, this.block.width*.8, this.block.height*.8), Phaser.Geom.Rectangle.Contains)
        // this.setInteractive();
        this.scene.input.setDraggable([this], true)
        Phaser.Display.Align.In.Center(this,this.block)
        this.draggable=true
    
        }
        disableDraggable(){
            this.disableInteractive()
            this.draggable=false

        }

        revertPiece(){
            this.newBlock=this.block
            Phaser.Display.Align.In.Center(this,this.block)
        }    


  
            updatePiece(){
                if(this.owner==null){
                    this.setFillStyle(0xeb3434)
                    this.setAlpha(showHidden?1:hiddenAlpha)
        
                }
                else if(this.owner=="white"){
                    this.setFillStyle(0xffffff)
                    this.setStrokeStyle(lineThick,lineColor)
                    this.setAlpha(1)
        
                }
        
                else if(this.owner=="black"){
                    this.setFillStyle(0x000000)
                    this.setStrokeStyle(lineThick,lineColor)
                    this.setAlpha(1)
        
        
        
                }
        
            }
    shrink(){
        this.setRadius(Math.max(this.radius/4,2))

    }
    normalSize(){
        this.setRadius(Math.max(this._radius,7))

    }

    setNewBlock(block){
        this.newBlock=block
    }

//checkers



checkDraggable(){
    let col=this.block.col
    let row=this.block.row

    if ((row>data["sideborder"]/2+1 && col>data["sideborder"]/2+1&& col<data["squaresCount"]+(data["sideborder"]/2) && row<data["squaresCount"]+(data["sideborder"]/2))==true)
    {
        return true
    }
    return false  


}
checkGamePiece(){
    let col=this.block.col
    let row=this.block.row
    if ((row>data["sideborder"]/2 && col>data["sideborder"]/2 && col<data["squaresCount"]+(data["sideborder"]/2)+1 && row<data["squaresCount"]+(data["sideborder"]/2)+1)==true) this.gamePiece=true
    else this.gamePiece=false
}


vertNeighbors(){
    for(const ele of Object.values(this.neighbors).filter(ele=>ele.owner!="out")){
            ele.revertPiece()
        }

}

    
 



//tester
    
    



 

//event helpers

getDir(){
    let rowchange=this.newBlock.row-this.block.row
    let colchange=this.newBlock.col-this.block.col

    if(colchange==0 && rowchange==0){
        return 0
    }
    else if(colchange==0 && rowchange>=1){
        return data["squaresCount"]+data["sideborder"]
    }
    else if(colchange==0 && rowchange<0){
        return -data["squaresCount"]-data["sideborder"]
    }
  
    else if(rowchange==0 && colchange>=1){
        return 1
    }

    else if(rowchange==0 && colchange<0){
        return -1
    }

    else if(Math.abs(rowchange)!=Math.abs(colchange)){
        return
    }
  

    else if(rowchange<0 && colchange<0){
        return -data["squaresCount"]-data["sideborder"]-1
    }


    else if(rowchange<0 && colchange>0){
        return -data["squaresCount"]-data["sideborder"]+1
    }

    else if(rowchange>0 && colchange<0){
        return data["squaresCount"]+data["sideborder"]-1
    }


    else if(rowchange>0 && colchange>0){
        return data["squaresCount"]+data["sideborder"]+1
    }

}

 


    movePiece(){
        
    let dir=this.getDir()
    if(dir==0) { 
        this.newBlock=this.block
        this.block.board.swapPieces(this.index,this.index)
        }
   else  this.block.board.swapPieces(this.index,this.newBlock.index)
    }

    updateOwner(owner) {
    this.owner = owner;

    if (this.owner === null) {
        // Style for an empty, inactive space
        this.setFillStyle(0x1a1a1a, 0.01); // Nearly invisible
        this.disableInteractive();
    } else if (this.owner === "white") {
        // Style for a white piece
        this.setFillStyle(0xffffff);
        this.setStrokeStyle(2, 0x000000); // Black outline
        this.setInteractive();
    } else if (this.owner === "black") {
        // Style for a black piece
        this.setFillStyle(0x000000);
        this.setStrokeStyle(2, 0xffffff); // White outline
        this.setInteractive();
    }
}


    
//events

   
    startDrag(){
        this.addStartIndicator()

    }

    addStartIndicator(){
        this.scene._clearHighlights();
if (this.block && this.block.zone) {
    this.scene._drawHighlight(this.block.zone, 0x39FF33, 15);
}        
    }


    
  
handlePointerDown(){

        setTimeout(()=>{
            this.shrink()
            this.showNeighbors()
        },0)
        

    }
    showNeighbors(){
        Object.values( this.block.board.getNeighborsOfPiece(this)).filter((e)=>e.owner==null).forEach((e)=> e.setAlpha(showAlpha)
        )
    }


    hideNeighbors(){
        Object.values( this.block.board.getNeighborsOfPiece(this)).filter((e)=>e.owner==null).forEach((e)=>e.setAlpha(showHidden?1:hiddenAlpha))
    }
    handlePointerOut(){
        setTimeout(()=>{
            this.setRadius(Math.max(this._radius,7))
        },0)
    
    }
    handlePointerUp(){
        setTimeout(()=>{
            this.normalSize()
            this.hideNeighbors()
        },0)
    }

    enterTarget(pointer, target) {
        if (target === this.block.zone) {
            return;
        }
        // target.addZoneLine()
        this.scene._drawHighlight(target);
    }
    
    leaveTarget(pointer,target){
        if (target==this.block.zone){
            return
        }
        target.scene._clearHighlights()
        this.addStartIndicator()

        

    }

}



