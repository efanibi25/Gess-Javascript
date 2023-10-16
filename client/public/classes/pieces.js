export default class boardPiece extends Phaser.GameObjects. Arc {

    constructor(scene,x=0,y=0,radius=50,index){
        super(scene, x, y,radius=radius)
        this.scene=scene
        this.addListener('drag', this.doDrag);

        this.scene.events.addListener('updatePiece', this.updatePiece,this);
        this.prevOwner=null
        this.newOwner=null
        this.index=index
        // this.input.on('drag',this.doDrag,this)
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
        if(true){
            this.revertPiece()
        }
    }

    
    doDrag(event){
            this.x = event.x;
            this.y = event.y;
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

