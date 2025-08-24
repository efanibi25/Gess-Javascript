// piece.js
// This file contains the Piece class, which represents a single game piece.

// Require the necessary constants from the shared player file.
const {squaresCount,sideborder}=require("../../shared/player.js")

class Piece{
    constructor(index,row,col,board){
        this.index=index
        this.row=row+1
        this.col=col+1
        this.neighborsDexes=[0,-1,1,-squaresCount-sideborder,
        squaresCount+sideborder,squaresCount+
        sideborder+1,-squaresCount-sideborder-1,
        squaresCount+sideborder-1,-squaresCount-
        sideborder+1]
        this.owner=null
        this.board=board
    } 

    getNeighbors(){
        let out={}
        if (this.neighbors) return  this.neighbors
        for (const ele of this.neighborsDexes){
            let piece=this.board.getPiece(this.index+ele)
            out[ele]=piece   
        }
        this.neighbors=out
        return out
        }

    checkRing(opp=false){
            this.getNeighbors()  
            if(this.owner==null){
                if(!opp)
                return Object.values(this.neighbors).filter( ele=>ele!=null&&ele.index!=this.index && ele.owner=="mine").length==8
                else
                return Object.values(this.neighbors).filter( ele=>ele!=null&&ele.index!=this.index && ele.owner=="opponent").length==8

            }
            return false
        }

   
    
}

// Export the Piece class for use in other files.
module.exports={Piece}
