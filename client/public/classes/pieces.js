
/*
Piece Libary
Note: Piece never change location only attributes based on grab events and validation of moves

*/
import { squaresCount } from "../res/player.js"
import { sideborder } from "../res/player.js"
const neighbors=[0,-1,1,-squaresCount-sideborder,squaresCount+sideborder,squaresCount+sideborder+1,-squaresCount-sideborder-1,squaresCount+sideborder-1,squaresCount-sideborder+1]
const dirNeighbors=[-squaresCount-sideborder,squaresCount+sideborder,squaresCount+sideborder+1,-squaresCount-sideborder-1,squaresCount+sideborder-1,squaresCount-sideborder+1]
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
        this.neigbors=null
        // this.input.on('drag',this.doDrag,this)
    }




    getNeighbors(){
    let out={}
    for (const ele of neighbors){
        let piece=this.block.board.getPiece(this.index+ele-1)
        if (piece){
            out[ele]=piece
        }
       
    }
    return out
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

        if(Object.values(this.neigbors)
            .filter(ele=>ele.owner==this.block.board.otherColor).length>0){
            document.querySelector("#alertBar").textContent="Can't Move Block With Opponent Pieces"
            valid=false
            setTimeout(()=>document.querySelector("#alertBar").textContent="", 2000);
        }


        if(Object.values(this.neigbors).length!=9){
        document.querySelector("#alertBar").textContent="Block Must Have 9 Pieces"
        valid=false
        setTimeout(()=>document.querySelector("#alertBar").textContent="", 2000);
    }

        else if(Object.values(this.neigbors).filter(ele=>ele.owner==this.block.board.color).length==0){
            document.querySelector("#alertBar").textContent="Can't Move Block With No Pieces"
            valid=false
            setTimeout(()=>document.querySelector("#alertBar").textContent="", 2000);
        }

        return valid
    }

    getDir(){
        let rowchange=this.newBlock.row-this.block.row
        let colchange=this.newBlock.col-this.block.col

        if(colchange==0 && rowchange==0){
            return
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
        console.log(dir)
        if (dir==null){
            document.querySelector("#alertBar").textContent="The Given Direction does not have a piece"
            valid=false
            setTimeout(()=>document.querySelector("#alertBar").textContent="", 2000);  
        }
        else if (this.neigbors[dir].owner!=this.block.board.color ){
            document.querySelector("#alertBar").textContent="The Given Direction does not have a piece"
            valid=false
            setTimeout(()=>document.querySelector("#alertBar").textContent="", 2000); 
        }
        return valid


    }

    revertNeighbors(){
        for(const ele of Object.values(this.neigbors)){
                ele.revertPiece()
            }
   
    }


    swapNeighbors(){


    //     for(const ele of Object.values(this.neigbors)){
    //         this.newBlock.index+ele.index
    // }

        //revert after swamp properties
        for(const ele of Object.values(this.neigbors)){
                ele.revertPiece()
        }
   
    }


    startDrag(){
        if (this.neigbors==null){
            this.neigbors=this.getNeighbors()
        }
    }
    
    doDrag(event){
        let difX=event.x-this.x
        let difY=event.y-this.y
        for(const ele of Object.values(this.neigbors)){
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

