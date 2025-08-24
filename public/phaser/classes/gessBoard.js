import boardBlock from "./gessBlock.js";
import { data } from "../../scripts/lib/network.js";
const stroke=8
const showStroke=true
import { getOtherPlayerPieces, getMyPieces} from "../utils/gameUtils.js";
import { getPiece} from "../utils/boardUtils.js";
export default class gessBoard extends Phaser.GameObjects.Container {

    constructor(scene,player,gameData){
        super(scene, 0, 0);
        this.chessboardOffsetX =10
        this.chessboardOffsetY=10
        this.canvas=scene.game.canvas
        this.width = (this.canvas.width - this.chessboardOffsetX);
        this.height = (this.canvas.height - this.chessboardOffsetY);
        this.squareSize = Math.floor(Math.min((this.width / data["squaresCount"]),(this.height / (data["squaresCount"]+data["sideborder"]))))
        this.board=[]
    
        this.player=player
        this.setColor()
       this.gameData=gameData

        this.rings=[]
    
    }

    //actions
    create(){
        this.createBoard()
        this.upDateGameBlocks()
        this.scene.add.existing(this);
    }

    destroyAll(){
        this.destroy()
        this.board.forEach(e=e.destroyAll())
    }

    createBoard(){
        this.extendBoardArray()
        Phaser.Actions.GridAlign(this.board, {
          width:data["squaresCount"]+data["sideborder"],
          height: data["squaresCount"]+data["sideborder"],
          x: this.chessboardOffsetX/2+(this.width/2)-(this.squareSize*(data["squaresCount"]+data["sideborder"])/2),
          y: this.chessboardOffsetY/2,
          cellWidth:this.squareSize,
          cellHeight:this.squareSize
          
      });
    }

       
    extendBoardArray(){
        let i=0
        let k=0
        let count=0
        while (i <data["squaresCount"]+data["sideborder"]){
            k=0
            while (k <data["squaresCount"]+data["sideborder"]){
                //full board has invisible pieces
                let rect = new boardBlock(this.scene,0, 0, this.squareSize,this.squareSize,i,k,count,this)
                count=count+1
                if ((i<(data["sideborder"]/2) || k<(data["sideborder"]/2) || i>=data["squaresCount"]+(data["sideborder"]/2) || k>=data["squaresCount"]+(data["sideborder"]/2))==false){
                    this.board.push(rect)
                    this.add(rect)
                
                    if(showStroke) rect.setStrokeStyle(stroke, 0x000000);

                }
                else{
                    this.board.push(rect)
                    this.add(rect)
                    rect.makeinvisible()
                    if(showStroke) rect.setStrokeStyle(stroke, 0x0000FF);

                }
                k=k+1
             
    
            }
            i=i+1
            
        
           
        }
      }



    //modifiers
    setColor(){
        if(this.player=="player1"){
            this.color="white"
            this.otherColor="black"
        }

        else{
            this.color="black"
            this.otherColor="white" 
        }
    }
    
    upDateGameBlocks(){
        let otherPlayerPieces=getOtherPlayerPieces(this.player)
        let myPieces=getMyPieces(this.player)
        let i=0

        while ( i< Math.pow(data["squaresCount"]+data["sideborder"],2)) {
            let row=this.board[i].row
            let col=this.board[i].col
            this.board[i].index=i+1
            this.add(this.board[i].initPiece())
            if (col==data["sideborder"]/2){
                this.board[i].addNum(row)
            }

            else if (row==data["sideborder"]/2){
                this.board[i].addText(col)
            }
           
        
            i=i+1
        
        }
        i=0
        while ( i< Math.pow(data["squaresCount"]+data["sideborder"],2)) {
            let piece=this.board[i].piece
            piece.checkGamePiece()
            i=i+1
        }
        i=0
        let k=0

        while ( i< Math.pow(data["squaresCount"]+data["sideborder"],2)) {
                let piece=this.board[i].piece
                if(piece.gamePiece){
                //use raw index
                let piece=this.board[i].piece
                this.board[i].addZone()
                if (myPieces.has(i+1)==true){
                    piece.owner=this.color   
                } 
                //just show other player pieces
                else if (otherPlayerPieces.has(i+1)==true){
                    piece.owner=this.otherColor  
                } 
            
            }

            i=i+1
        }
        this.scene.events.emit('updatePiece');

        }


}

