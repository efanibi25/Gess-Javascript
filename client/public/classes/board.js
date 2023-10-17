import { PLAYER1_PIECES } from "../res/player.js";
import { PLAYER2_PIECES } from "../res/player.js";
import boardBlock from "./block.js";
import { squaresCount } from "../res/player.js";
import { sideborder } from "../res/player.js";

export default class gessBoard extends Phaser.GameObjects.Container {

    constructor(scene,x=0,y=0,player=1,color="white",otherColor="black"){
        super(scene, x, y);
        this.scene=scene
        this.chessboardOffsetX =20
        this.chessboardOffsetY=10
        this.canvas=scene.game.canvas
        this.width = (this.canvas.width - this.chessboardOffsetX);
        this.height = (this.canvas.height - this.chessboardOffsetY);
        this.squareSize = Math.floor(Math.min((this.width / squaresCount),(this.height / (squaresCount+sideborder))))
        this.board=[]
        this.pieces={}
        this.stroke=8
        this.player=player
        this.color=color
        this.otherColor=otherColor
    
    }
    create(){
        this.createBoard()
        this.upDateGameBlocks()
        this.scene.add.existing(this);
    }

    createBoard(){
        this.extendBoardArray()
        Phaser.Actions.GridAlign(this.board, {
          width:squaresCount+sideborder,
          height: squaresCount+sideborder,
          x: this.chessboardOffsetX/2+(this.width/2)-(this.squareSize*(squaresCount+sideborder)/2),
          y: this.chessboardOffsetY/2,
          cellWidth:this.squareSize,
          cellHeight:this.squareSize
          
      });
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


    upDateGameBlocks(){
        let otherPlayerPieces=this.getOtherPlayerPieces()
        let myPieces=this.getMyPieces()
        this.pieces={}
        let i=0
        let k=0

        while ( i< Math.pow(squaresCount+6,2)) {
            let row=this.board[i].row
            let col=this.board[i].col
            this.board[i].addZone()
            if (row==3 && col<22 && col>3){
                this.board[i].addText(col)
            }
            else if (col==3 && row<22 && row>3){
                this.board[i].addText(row)
            }
            
            else if ((row<=3 || col<=3 || col>=22 || col>=22)==false){    
            let index=k+1
            //use raw index
            this.board[i].index=i+1
            this.add(this.board[i].initPiece())
            let piece=this.board[i].piece
            this.pieces[k+1]=piece

            if (myPieces.has(index)==true){
                piece.owner=this.color   
                this.board[i].piece.allowDraggable()  
            } 
            //just show other player pieces
            else if (otherPlayerPieces.has(index)==true){
                this.board[i].piece.owner=this.otherColor  
            } 
            //secret grab zone
            else{
                this.board[i].piece.allowDraggable()
            }
            k=k+1
        }
        i=i+1
  
           
        }
       
        this.scene.events.emit('updatePiece');


    }



    getPiece(index){
        return this.board[index].piece
    }

     
    extendBoardArray(){
        let i=0
        let k=0
        while (i <squaresCount+sideborder){
            k=0
            while (k <squaresCount+sideborder){
                //full board has invisible pieces
                let rect = new boardBlock(this.scene,0, 0, this.squareSize,this.squareSize,i,k,this)
                if ((i<=2 || k<=2 || i>=21 || k>=21)==false){
                    this.board.push(rect)
                    this.add(rect)
                    rect.setStrokeStyle(this.stroke, 0x000000);

                }
                else{
                    this.board.push(rect)
                    this.add(rect)
                    // rect.setStrokeStyle(this.stroke, 0x000000);
                    rect.makeinvisible()
                }
                k=k+1
             
    
            }
            i=i+1
            
        
           
        }
      }


     
  
    

}

