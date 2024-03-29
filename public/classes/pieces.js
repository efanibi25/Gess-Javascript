
/*
Piece Libary
Note: Piece never change location only attributes based on grab events and validation of moves

*/
import { data } from "../scripts/client.js"


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

    //manipulators
       
    allowDraggable(){
        this.setInteractive( new Phaser.Geom.Rectangle(0 ,0, this.block.width*.8, this.block.height*.8), Phaser.Geom.Rectangle.Contains)
        // this.setInteractive();
        this.scene.input.setDraggable([this], true)
        this.alignCenter()
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


        alignCenter(){
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


//neighors

    getNeighbors(){
    let out={}
    for (const ele of this.neighborsDexes){
        let piece=this.block.board.getPiece(this.index+ele)
        out[ele]=piece   
    }
    this.neighbors=out
    return out
    }



getRingNeighbors(){
    let piece=this.newBlock.piece

    piece.getNeighbors()
    return Object.keys(this.neighbors).filter(ele=>ele!=0).reduce((accumulator, currentValue)=>{
        accumulator.push(piece.neighbors[currentValue])
        piece.neighbors[currentValue].getNeighbors()
        accumulator.push(piece.neighbors[currentValue].neighbors[currentValue])
        return accumulator
    },[this.newBlock.piece])



}
revertNeighbors(){
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
        this.swapNeighbors(this.index,this.index)
        }
   else  this.swapNeighbors(this.index,this.newBlock.index)
    }


            swapNeighbors(index,newIndex){
                let colorDict={}
                let target=this.block.board.getPiece(newIndex)
                let start=this.block.board.getPiece(index)
                target.getNeighbors()
                start.getNeighbors()
        
                
                for(const key of Object.keys(start.neighbors)){
        
                    colorDict[key]=start.block.piece.neighbors[key].owner
                    start.block.piece.neighbors[key].owner=null
                    start.block.piece.neighbors[key].alignCenter()
                }
                for(const key of Object.keys(this.neighbors)){
                    //out of bounds
                    if(target.block.piece.neighbors[key].block.col>=data["squaresCount"]+(data["sideborder"]/2)+1 || 
                    target.block.piece.neighbors[key].block.col<data["sideborder"]/2+1) continue
        
                    else if(target.block.piece.neighbors[key].block.row>=data["squaresCount"]+(data["sideborder"]/2)+1 || 
                    target.block.piece.neighbors[key].block.row<data["sideborder"]/2+1) continue
                    
                    //merge blocks
                    if (target.block.piece.neighbors[key].owner==this.block.board.color) continue
        
                    target.block.piece.neighbors[key].owner=colorDict[key]
        
                }
                
        
                }

    
//events

   
    startDrag(){
        if (this.neighbors==null){
            this.getNeighbors()
        }
        this.addStartIndicator()

    }

    addStartIndicator(){
        this.block.zone.removeZoneLine()
        this.block.zone.addZoneLine(0x39FF33,15)
        
    }


    
  
handlePointerDown(){

        setTimeout(()=>{
            this.shrink()
            this.showNeighbors()
        },0)
        

    }
    showNeighbors(){
        this.getNeighbors()
        Object.values(this.neighbors).filter((e)=>e.owner==null).forEach((e)=> e.setAlpha(showAlpha)
        )
    }


    hideNeighbors(){
        this.getNeighbors()
        Object.values(this.neighbors).filter((e)=>e.owner==null).forEach((e)=>e.setAlpha(showHidden?1:hiddenAlpha))
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

    enterTarget(pointer,target){
        if (target==this.block.zone){
            return
        }
        target.addZoneLine()

    }
    leaveTarget(pointer,target){
        if (target==this.block.zone){
            return
        }
        target.removeZoneLine()
    }

}

