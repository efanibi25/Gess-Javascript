import boardPiece from "./pieces.js";
const zoneMulti=1.2
const showZoneLine=false
const color=0xadd8e6

export default class boardBlock extends Phaser.GameObjects. Rectangle {

    constructor(scene,x=0,y=0,width,height,index,board){
        super(scene, x, y,width,height)
        this.index=index+1
        this.setFillStyle(color)
        this.zone= new Phaser.GameObjects.Zone(this.scene, 0, 0, width, height).setRectangleDropZone(width*zoneMulti, width*zoneMulti)      
        this.zone.block=this
        this.width=width
        this.height=height
        this.board=board


    }

    setZoneCenter(){
        let zone=this.zone
    Phaser.Display.Align.In.Center(zone,this) 
    if (showZoneLine){
        const graphics = this.scene.add.graphics();
        graphics.lineStyle(2, 0xffff00);
        graphics.strokeRect(zone.x - zone.input.hitArea.width / 2, zone.y - zone.input.hitArea.height / 2, zone.input.hitArea.width, zone.input.hitArea.height);     

    }
  
    }
    initPiece(){
        this.piece=new boardPiece(this.scene,0,0,this.width/2-10,this.index,this)
        this.piece.prevBlock=this
        Phaser.Display.Align.In.Center(this.piece,this)
        return this.piece
    }

}