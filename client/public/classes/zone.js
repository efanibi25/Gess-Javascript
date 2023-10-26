const zoneMulti=.9
const showZoneLine=false
const zoneLineThick=12
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
            this.graphics.setDepth(5)
        }
     
    }
    setZoneCenter(){
        let zone=this

    Phaser.Display.Align.In.Center(zone,this.block) 
    if (showZoneLine){
        this.addZoneLine()
    }

  
    }
    addZoneLine(color=null,thick=null){
        if(color==null){
            color=zoneColor
        }
        if(thick==null){
            thick=zoneLineThick
        }
        let zone=this
        this.addGraphics()
        const graphics = this.graphics
        graphics.lineStyle(thick,color);
        graphics.strokeRect(zone.x - zone.input.hitArea.width / 2, zone.y - zone.input.hitArea.height / 2, zone.input.hitArea.width, zone.input.hitArea.height);     
    }
    removeZoneLine(){
        if(this.graphics){
            this.graphics.destroy()
            this.graphics=null
           
        }
      
        

    }
}