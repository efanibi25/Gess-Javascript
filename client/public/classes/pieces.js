
/*
Piece Libary
Note: Piece never change location only attributes based on grab events and validation of moves

*/
import { squaresCount } from "../res/player.js"
import { sideborder } from "../res/player.js"
const neighbors=[0,-1,1,-squaresCount-sideborder,squaresCount+sideborder,squaresCount+sideborder+1,-squaresCount-sideborder-1,squaresCount+sideborder-1,-squaresCount-sideborder+1]
const dirNeighbors=[-squaresCount-sideborder,squaresCount+sideborder,squaresCount+sideborder+1,-squaresCount-sideborder-1,squaresCount+sideborder-1,-squaresCount-sideborder+1]
export default class boardPiece extends Phaser.GameObjects. Arc {

    constructor(scene,x=0,y=0,radius=50,index,block){
        super(scene, x, y,radius=radius)
        this.scene=scene
        this.addListener('drag', this.doDrag);
        this.addListener('dragstart', this.startDrag);
        this.scene.events.addListener('updatePiece', this.updatePiece,this);
        this.owner=null
        this.index=index
        this.block=block
        this.newBlock=null
        this.neighbors=null
        this.prevOwner=null
    }




    getNeighbors(){
    let out={}
    for (const ele of neighbors){
        let piece=this.block.board.getPiece(this.index+ele)
        out[ele]=piece   
    }
    this.neighbors=out
    return out
    }

    addNeighborRings(){
    this.block.board.addRings([this])
    for (const ele of dirNeighbors){
        this.block.board.addRings([this.block.board.getPiece(this.index+ele),this.block.board.getPiece(this.index+ele*2),this.block.board.getPiece(this.index+ele*3)])  
    }   
    
    }


    
    checkRing(){
        this.getNeighbors()
        return (Object.values(this.neighbors).filter(ele=>ele.index!=this.index && ele.owner==this.block.board.color).length==8)
    }
    
    allowDraggable(){
    this.setInteractive({ draggable: true});
    this.scene.input.setDraggable(this, true)

    }
    disableDraggable(){
        this.setInteractive({ draggable: false});
        this.scene.input.setDraggable(this, false)
    }

    setNewBlock(block){
        this.newBlock=block
    }


    revertPiece(){
        this.newBlock=this.block
        Phaser.Display.Align.In.Center(this,this.block)
        
    }
    testValidBlock(){
        let valid=true

        if(Object.values(this.neighbors)
            .filter(ele=>ele.owner==this.block.board.otherColor).length>0){
            document.querySelector("#alertBar").textContent="Can't Move Block With Opponent Pieces"
            valid=false
            setTimeout(()=>document.querySelector("#alertBar").textContent="", 2000);
        }

        else if(Object.values(this.neighbors)
        .filter(ele=>ele.owner!="out").length!=9){
        document.querySelector("#alertBar").textContent="Block Must Have 9 Pieces"
        valid=false
        setTimeout(()=>document.querySelector("#alertBar").textContent="", 2000);
    }

        else if(Object.values(this.neighbors).filter(ele=>ele.owner==this.block.board.color).length==0){
            document.querySelector("#alertBar").textContent="Can't Move Block With No Pieces"
            valid=false
            setTimeout(()=>document.querySelector("#alertBar").textContent="", 2000);
        }

        return valid
    }


    alignCenter(){
    Phaser.Display.Align.In.Center(this,this.block)
    }

    getDir(){
        let rowchange=this.newBlock.row-this.block.row
        let colchange=this.newBlock.col-this.block.col

        if(colchange==0 && rowchange==0){
            return 0
        }
        else if(colchange==0 && rowchange>=1){
            return squaresCount+sideborder
        }
        else if(colchange==0 && rowchange<0){
            return -squaresCount-sideborder
        }
      
        else if(rowchange==0 && colchange>=1){
            return 1
        }

        else if(rowchange==0 && colchange<0){
            return -1
        }

        else if(rowchange!=colchange){
            return
        }
      

        else if(rowchange<0 && colchange<0){
            return -squaresCount-sideborder-1
        }


        else if(rowchange<0 && colchange>0){
            return -squaresCount-sideborder+1
        }

        else if(rowchange>0 && colchange<0){
            return squaresCount+sideborder-1
        }


        else if(rowchange>0 && colchange>0){
            return squaresCount+sideborder+1
        }

    }
    
    
    
    
    
    testValidBlockMove(){
        let valid=true
        let dir=this.getDir()

        if (dir==0){
            document.querySelector("#alertBar").textContent="You must Move at least 1 block"
            valid=false
            setTimeout(()=>document.querySelector("#alertBar").textContent="", 2000);     
        }
        else if (dir==null){
            document.querySelector("#alertBar").textContent="The Given Direction does not have a piece"
            valid=false
            setTimeout(()=>document.querySelector("#alertBar").textContent="", 2000);  
        }
        else if (this.neighbors[dir].owner!=this.block.board.color ){
            document.querySelector("#alertBar").textContent="The Given Direction does not have a piece"
            valid=false
            setTimeout(()=>document.querySelector("#alertBar").textContent="", 2000); 
        }
        else if(this.owner==null && Math.abs((this.newBlock.index-this.block.index)/dir)>3){
            document.querySelector("#alertBar").textContent="You can only move 3 blocks in a direction without a center piece"
            valid=false
            setTimeout(()=>document.querySelector("#alertBar").textContent="", 2000);    
        }
        return valid


    }

    revertNeighbors(){
        for(const ele of Object.values(this.neighbors).filter(ele=>ele.owner!="out")){
                ele.revertPiece()
            }
   
    }


    movePiece(){
    let dir=this.getDir()
    if(dir>0) this.movePiecePos(dir)
    else this.movePieceNeg(dir)
    }

    movePiecePos(dir){
        for(let i=this.block.index;i<this.newBlock.index;i=i+dir){
            if(this.swapNeighbors(i,dir)==false){
                break
            }
        }
        }
    

        movePieceNeg(dir){
            for(let i=this.block.index;i>this.newBlock.index;i=i+dir){
                if(this.swapNeighbors(i,dir)==false){
                    break
                }
            }
            }

    


    swapNeighbors(index,dir){
        let colorDict={}
        let target=this.block.board.getPiece(index+dir)
        let start=this.block.board.getPiece(index)
        target.getNeighbors()
        start.getNeighbors()
        let noOverlap=true
     
        for(const key of Object.keys(start.neighbors)){

            colorDict[key]=start.block.piece.neighbors[key].owner
            start.block.piece.neighbors[key].owner=null
            start.block.piece.neighbors[key].alignCenter()
        }
        for(const key of Object.keys(this.neighbors)){
            if(target.block.piece.neighbors[key].block.col>=squaresCount+(sideborder/2)+1 || 
            target.block.piece.neighbors[key].block.col<sideborder/2+1) continue

            if(target.block.piece.neighbors[key].block.row>=squaresCount+(sideborder/2)+1 || 
            target.block.piece.neighbors[key].block.row<sideborder/2+1) continue
            if(target.block.piece.neighbors[key].owner!=null) noOverlap=false

            target.block.piece.neighbors[key].owner=colorDict[key]

        }
        return noOverlap
        

        }
        

   
    


    startDrag(){
        if (this.neighbors==null){
            this.getNeighbors()
        }
    }
    
    doDrag(event){
        let difX=event.x-this.x
        let difY=event.y-this.y
        for(const ele of Object.values(this.neighbors).filter(e=>e)){
            ele.x = ele.x+difX;
            ele.y = ele.y+difY;
        }
    
       
        // this.y = event.y;
    }

    disableDrag(){

    }
    updatePiece(){
        if(this.owner==null){
            this.setFillStyle(0xffffff,0)
            this.setStrokeStyle()

        }
        else if(this.owner=="white"){
            this.setFillStyle(0xffffff)
            this.setStrokeStyle(7,0xFF0000)

        }

        else if(this.owner=="black"){
            this.setFillStyle(0x000000)
            this.setStrokeStyle(7,0xFF0000)

        }

    }


  

}

