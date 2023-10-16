import boardPiece from "./pieces.js";

export default class boardBlock extends Phaser.GameObjects. Rectangle {

    constructor(scene,x=0,y=0,width,height,index,color=0xADD8E6){
        super(scene, x, y,width,height)
        this.index=index+1
        this.setFillStyle(color)
        this.zoneMulti=4
        this.zone= new Phaser.GameObjects.Zone(this.scene, 0, 0, width, height).setRectangleDropZone(width*this.zoneMulti, width*this.zoneMulti)      
        this.zone.block=this
        this.width=width
        this.height=height


    }

    setZoneCenter(){
        let zone=this.zone
    Phaser.Display.Align.In.Center(zone,this) 
  
            const graphics = this.scene.add.graphics();
            graphics.lineStyle(2, 0xffff00);
            graphics.strokeRect(zone.x - zone.input.hitArea.width / 2, zone.y - zone.input.hitArea.height / 2, zone.input.hitArea.width, zone.input.hitArea.height);     

    }
    initPiece(){
        this.piece=new boardPiece(this.scene,0,0,this.width/2-10,this.index)
        this.piece.prevBlock=this
        Phaser.Display.Align.In.Center(this.piece,this)
        return this.piece
    }

}