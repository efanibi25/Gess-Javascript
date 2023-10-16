
/*
Piece Libary
Note: Piece never change location only attributes based on grab events and validation of moves

*/

export default class boardPiece extends Phaser.GameObjects. Arc {

    constructor(scene,x=0,y=0,radius=50,index,block){
        super(scene, x, y,radius=radius)
        this.scene=scene
        this.addListener('drag', this.doDrag);
        this.addListener('dragstart', this.startDrag);


        this.scene.events.addListener('updatePiece', this.updatePiece,this);
        this.prevOwner=null
        this.newOwner=null
        this.index=index
        this.block=block
        this.neigbors=null
        // this.input.on('drag',this.doDrag,this)
    }




    getNeighbors(){
    let out=[]
    for (const ele of [0,-1,1,-18,18,-19,19,-17,17]){
        let piece=this.block.board.getPiece(this.index+ele)
        if (piece){
            out.push(piece)
        }
       
    }
    return out
    }




    
    
    
    allowDraggable(){
    this.setInteractive({ draggable: true});
    this.scene.input.setDraggable(this, true)

    }

    setNewBlock(block){
        this.newBlock=block
        console.log(this.newBlock.index)
    }

    updatePrevBlock(){
        this.prevBlock=this.newBlock
    }

    revertPiece(){
        this.newBlock=this.prevBlock
        Phaser.Display.Align.In.Center(this,this.prevBlock)
        
    }
    testValid(){
        let valid=true
        if(this.neigbors.filter(ele=>ele.newOwner==this.block.board.color).length==0){
            Swal.fire(
                'Invalid Move',
                "Can't Move Block with No Piece",
                'warning'
              )
            valid=false

        }
        else if(this.neigbors.filter(ele=>ele.newOwner==this.block.board.otherColor).length>0){
            Swal.fire(
                'Invalid Move',
                "Can't Move Block Opponent Piece",
                'warning'
              )
            valid=false
        }


        if(valid==false){
            for(const ele of this.neigbors){
                ele.revertPiece()
            }
   
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
        for(const ele of this.neigbors){
            ele.x = ele.x+difX;
            ele.y = ele.y+difY;
        }
    
       
        // this.y = event.y;
    }
    updatePiece(){
        if(this.newOwner==null){
            this.setFillStyle(0xffffff,0)
        }
        else if(this.newOwner=="white"){
            this.setFillStyle(0xffffff)
            this.setStrokeStyle(7,0xFF0000)

        }

        else if(this.newOwner=="black"){
            this.setFillStyle(0x000000)
            this.setStrokeStyle(7,0xFF0000)

        }

    }


  

}

