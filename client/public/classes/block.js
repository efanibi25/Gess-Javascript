import boardPiece from "./pieces.js";
import { sideborder } from "../res/player.js";
const zoneMulti=1.2
const showZoneLine=false
const color=0xadd8e6
const altColor=0xD6D6B3

export default class boardBlock extends Phaser.GameObjects. Rectangle {

    constructor(scene,x=0,y=0,width,height,row,col,board){
        super(scene, x, y,width,height)
        this.row=row+1
        this.col=col+1
        this.width=width
        this.height=height
        this.board=board
        this.scene=scene
        this.piece=null
        this.zone=null
        this.text=null
        this.addBlockColor()


    }
    addBlockColor(){
        if(Number.isInteger(this.row/2)==false || Number.isInteger(this.col/2)==false){
            this.setFillStyle(altColor)
        }
    
        else {
            this.setFillStyle(color)

        }
    }
    addExtra(){
        this.addZone()
        this.addText()
    }

    addZone(){
    this.zone= new Phaser.GameObjects.Zone(this.scene, 0, 0, this.width, this.height).setRectangleDropZone(this.width*zoneMulti, this.width*zoneMulti)      
    this.zone.block=this
    this.scene.add.existing(this.zone)
    this.setZoneCenter()

    }
    addText(num){

        this.text=new Phaser.GameObjects.Text(this.scene, 0, 0, num-sideborder/2,{ fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',fontSize:"40px" ,fontStyle:"bold"})
        this.scene.add.existing(this.text)
        Phaser.Display.Align.In.Center(this.text,this) 
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
        Phaser.Display.Align.In.Center(this.piece,this)
        return this.piece
    }
    makeinvisible(){
        this.setFillStyle(0xffffff,0)
        this.index=null
    }

}