import boardPiece from "./pieces.js";
import { data } from "../../scripts/lib/network.js";
import Zone from "./zone.js";

const color=0xadd8e6
const altColor=0xD6D6B3
const showblockColor=true


export default class boardBlock extends Phaser.GameObjects. Rectangle {


    constructor(scene,x=0,y=0,width,height,row,col,index,board){
        super(scene, x, y,width,height)
        this.row=row+1
        this.col=col+1
        this.width=width
        this.height=height
        this.board=board
        this.piece=null
        this.zone=null
        this.text=null
        this.index=index
        this.neighborsDexes=[0,-1,1,-data["squaresCount"]-data["sideborder"],
        data["squaresCount"]+data["sideborder"],data["squaresCount"]+
        data["sideborder"]+1,-data["squaresCount"]-data["sideborder"]-1,
        data["squaresCount"]+data["sideborder"]-1,-data["squaresCount"]-
        data["sideborder"]+1]
        this.addBlockColor()

        



    }
    destroyAll(){
        this.destroy()
        if(this.zone)this.zone.destroy()
        if(this.piece)this.piece.destroy()

    }
  
    //modifcaiton
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


    addZone(){
    if(!this.neighbors){
        this.getNeighbors()
    }
    if(Object.values(this.neighbors).filter(e=>e!=null).length==9){
        this.zone= new Zone(this.scene, 0,0, this.width, this.height,this)
        this.zone.setZoneCenter()
    }
    

    }
    addNum(num){
        this.text=new Phaser.GameObjects.Text(this.scene, 0, 0, num-data["sideborder"]/2+1,{ fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',fontSize:"40px" ,fontStyle:"bold"})
        this.scene.add.existing(this.text)
        Phaser.Display.Align.In.Center(this.text,this) 
    }


    addText(num){
    if(num<=data["sideborder"]/2||num>(data["sideborder"]/2)+data["squaresCount"]) this.text=new Phaser.GameObjects.Text(this.scene, 0, 0, "*",{ fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',fontSize:"40px" ,fontStyle:"bold"})
    else this.text=new Phaser.GameObjects.Text(this.scene, 0, 0, String.fromCharCode(63+num-data["sideborder"]/2+1),{ fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',fontSize:"40px" ,fontStyle:"bold"})
    this.scene.add.existing(this.text)
    Phaser.Display.Align.In.Center(this.text,this) 
}

    makeinvisible(){
        this.setFillStyle(0xffffff,0)
    }
    
   


    //helpers
    initPiece(){
        this.piece=new boardPiece(this.scene,0,0,this.width/5,this.index,this)
        this.piece.alignCenter()
        return this.piece
    }
  

    getNeighbors(){
        let out=[]
        for (const ele of this.neighborsDexes){
            let block=this.board.getBlock(this.index+ele)
            out[ele]=block
        }
        this.neighbors=out
        }
}