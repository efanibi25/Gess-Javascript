import { PLAYER1_PIECES } from "../res/player.js";
import { PLAYER2_PIECES } from "../res/player.js";
import boardBlock from "./block.js";

export default class gessBoard extends Phaser.GameObjects.Container {

    constructor(scene,x=0,y=0,player=1,color="white",otherColor="black"){
        super(scene, x, y);
        this.scene=scene
        this.chessboardOffsetX = 40
        this.chessboardOffsetY=40
        this.squaresCount=18
        this.canvas=scene.game.canvas
        this.width = (this.canvas.width - this.chessboardOffsetX);
        this.height = (this.canvas.height - this.chessboardOffsetY);
        this.squareSize = Math.floor(Math.min((this.width / this.squaresCount),(this.height / this.squaresCount)))
        this.board=[]
        this.pieces={}
        this.stroke=8
        this.player=player
        this.color=color
        this.otherColor=otherColor
    
    }
    create(){
        this.createBoard()
        this.addPieces()
        this.scene.add.existing(this);
    }

    createBoard(){
        this.extendBoardArray()
        Phaser.Actions.GridAlign(this.board, {
          width:this.squaresCount,
          height: this.squaresCount,
          x: this.chessboardOffsetX/2+(this.width/2)-(this.squareSize*this.squaresCount/2),
          y: this.chessboardOffsetY/2,
          cellWidth:this.squareSize,
          cellHeight:this.squareSize
          
      });
      this.setCenter()
    }

    getOtherPlayerPieces(){
        if(this.player==1){
            return PLAYER2_PIECES
        }
        else{
            return PLAYER1_PIECES
        }
    }
    getMyPieces(){
        if(this.player==1){
            return PLAYER1_PIECES
        }
        else{
            return PLAYER2_PIECES
        }
    }


    addPieces(){
        let otherPlayerPieces=this.getOtherPlayerPieces()
        let myPieces=this.getMyPieces()
        
        for (let i = 0; i < Math.pow(this.squaresCount,2); i++) {
            this.add(this.board[i].initPiece())
            if (myPieces.has(i+1)==true){
                this.board[i].piece.newOwner=this.color   
                this.board[i].piece.allowDraggable()  
            } 
            //just show other player pieces
            else if (otherPlayerPieces.has(i+1)==true){
                this.board[i].piece.newOwner=this.otherColor  
            } 
            //secret grab zone
            else{
                this.board[i].piece.allowDraggable()
            }

           
           
        }
        this.scene.events.emit('updatePiece');


    }





     
    extendBoardArray(){
        for (let i = 0; i < Math.pow(this.squaresCount,2); i++){
            let rect = new boardBlock(this.scene,0, 0, this.squareSize,this.squareSize,i)
            this.board.push(rect)
            this.add(rect)
            this.add(rect.zone)
            rect.setStrokeStyle(this.stroke, 0x000000);

        }
      }


     
    setCenter(){
        for (let i = 0; i < Math.pow(this.squaresCount,2); i++){
            this.board[i].setZoneCenter()
        }
      }
    

}

