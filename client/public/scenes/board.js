

import gessBoard from "../classes/board.js"
export default class preload extends Phaser.Scene {


preload() {
    let image = new Image();
    let url="../assets/wood.jpg"
image.src = url
    this.load.image('background', url );
}
create() {
    this.add.image(0, 0, 'background');
    this.gessBoard=new gessBoard(this)
    this.gessBoard.create()
    this.dragGroup=[]
    




    this.input.on('drop', (pointer, gameObject, dropZone) =>
    {

        gameObject.x = dropZone.x;
        gameObject.y = dropZone.y;
        gameObject.setNewBlock(dropZone.block)

    });

    this.input.on('dragend', (pointer, gameObject, dropped) =>
    {


        if (!dropped)
        {
            gameObject.x = gameObject.input.dragStartX;
            gameObject.y = gameObject.input.dragStartY;
            gameObject.setNewBlock(gameObject.block)
        }
        if ( gameObject.testValidBlock()==false || gameObject.testValidBlockMove()==false){
            gameObject.revertNeighbors()
        }
        else{
            gameObject.swapNeighbors()
            this.events.emit('updatePiece');

        }
       
        

    });



}
  



  update(){
  }

}