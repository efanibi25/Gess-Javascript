const zoneMulti=.9
const showZoneLine=false
const zoneLineThick=10
const zoneColor=0xffff00
export default class Zone extends Phaser.GameObjects.Zone {

    constructor(scene,x=0,y=0,width,height,block){
        super(scene, x, y,width,height)
        this.block=block
        this.scene.add.existing(this);
        this.addGraphics()
        this.setRectangleDropZone(this.width*zoneMulti, this.width*zoneMulti) 


        



    }
    addGraphics(){
        if(this.graphics==null){
            this.graphics=this.scene.add.graphics();
            this.graphics.setDepth(3)
        }
     
    }
    setZoneCenter(){
        let zone=this

    Phaser.Display.Align.In.Center(zone,this.block) 
    if (showZoneLine){
        this.addZoneLine()
    }

  
    }
    addZoneLine(color=zoneColor){
        let zone=this
        this.addGraphics()
        const graphics = this.graphics
        graphics.lineStyle(zoneLineThick,color);
        graphics.strokeRect(zone.x - zone.input.hitArea.width / 2, zone.y - zone.input.hitArea.height / 2, zone.input.hitArea.width, zone.input.hitArea.height);     
    }
    removeZoneLine(){
        this.graphics.destroy()
        this.graphics=null
       
        

    }
}