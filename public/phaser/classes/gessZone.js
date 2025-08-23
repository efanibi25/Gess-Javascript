const zoneMulti=.9
export default class Zone extends Phaser.GameObjects.Zone {

    constructor(scene,x=0,y=0,width,height,block){
        super(scene, x, y,width,height)
        this.block=block
        this.scene.add.existing(this);
        this.setRectangleDropZone(this.width*zoneMulti, this.width*zoneMulti) 



    }

}