

import gessBoard from "../classes/board.js"
export default class preload extends Phaser.Scene {


preload() {
    let image = new Image();
    let url="../assets/wood.jpg"
image.src = url
    this.load.image('background', url );
    this.canvas = this.sys.game.canvas;
}
create() {
    this.add.image(0, 0, 'background');
    this.gessBoard=new gessBoard(this)
    this.gessBoard.create()
    this.input.dragTimeThreshold = 100;
    this.gameHeight=85


    document.querySelector("#plus-button").addEventListener("click", (function() {
        this.gameHeight=this.gameHeight*1.1
        document.querySelector("#game").style.height=`${this.gameHeight}vh`
    }).bind(this));


    document.querySelector("#minus-button").addEventListener("click", (function() {
        this.gameHeight=this.gameHeight/1.1
        document.querySelector("#game").style.height=`${this.gameHeight}vh`


    }).bind(this));
    this.input.on('drop', (pointer, gameObject, dropZone) =>
    {

        gameObject.x = dropZone.x;
        gameObject.y = dropZone.y;
        gameObject.setNewBlock(dropZone.block)

    });




    const dragfunct=(event, gameObject) =>
    {


        let difX=event.position.x-gameObject.x
        let difY=event.position.y-gameObject.y
        for(const ele of Object.values(gameObject.neighbors).filter(e=>e)){
            ele.x = ele.x+difX;
            ele.y = ele.y+difY;
        }
    

    }

    this.input.on('drag', dragfunct)





    this.input.on('dragend', (pointer, gameObject, dropped) =>
    {

        this.input.removeListener("drag")
        
        if (!dropped)
        {
            gameObject.x = gameObject.input.dragStartX;
            gameObject.y = gameObject.input.dragStartY;
            gameObject.setNewBlock(gameObject.block)
        }
        else if ( gameObject.testValidBlock()==false || gameObject.testValidBlockMove()==false){

            gameObject.revertNeighbors()
        }
        else{

            gameObject.movePiece()
            this.events.emit('updatePiece');
            console.log(["this number of rings",this.gessBoard.checkRings()])

        }
        this.input.addListener("drag",dragfunct)

       
        

    });



}
  



  update(){
  }

}