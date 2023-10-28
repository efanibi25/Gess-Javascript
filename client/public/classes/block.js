import boardPiece from "./pieces.js";
import { data } from "../scripts/client.js";
import Zone from "./zone.js";

const color=0xadd8e6
const altColor=0xD6D6B3
const showblockColor=true
let neighbors=[0,-1,1,-data["squaresCount"]-data["sideborder"],data["squaresCount"]+data["sideborder"],data["squaresCount"]+data["sideborder"]+1,-data["squaresCount"]-data["sideborder"]-1,data["squaresCount"]+data["sideborder"]-1,-data["squaresCount"]-data["sideborder"]+1]


export default class boardBlock extends Phaser.GameObjects. Rectangle {

    constructor(scene,x=0,y=0,width,height,row,col,index,board){
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
        this.index=index
        this.addBlockColor()
        



    }
    addBlockColor(){
        if(!showblockColor){
            return
        }
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
    if(!this.neighbors){
        this.getNeighbors()
    }
    if(Object.values(this.neighbors).filter(e=>e!=null).length==9){
        this.zone= new Zone(this.scene, 0,0, this.width, this.height,this)
        this.zone.setZoneCenter()
    }
    

    }
    addText(num){

        this.text=new Phaser.GameObjects.Text(this.scene, 0, 0, num-data["sideborder"]/2+1,{ fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',fontSize:"40px" ,fontStyle:"bold"})
        this.scene.add.existing(this.text)
        Phaser.Display.Align.In.Center(this.text,this) 
    }
    

  


    initPiece(){
        this.piece=new boardPiece(this.scene,0,0,this.width/5,this.index,this)
        this.piece.alignCenter()
        return this.piece
    }
    makeinvisible(){
        this.setFillStyle(0xffffff,0)
    }

    getNeighbors(){
        let out=[]
        for (const ele of neighbors){
            let block=this.board.getBlock(this.index+ele)
            out[ele]=block
        }
        this.neighbors=out
        }
}