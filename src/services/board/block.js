// block.js
// This file contains the Block class, which represents a single square on the board.

// Require the necessary constants from the shared player file.
const {squaresCount,sideborder}=require("../../shared/player.js")

// The Block class represents a single square on the game board.
class Block
{ 
    
constructor(index,row,col,board){
    this.index=index+1
    this.row=row+1
    this.col=col+1
    this.board=board
    this.piece=null

    
}

checkGamePiece(){
    let col=this.col
    let row=this.row
    if(this.piece==false){
        return false
    }
    if ((row>sideborder/2 && col>sideborder/2 && col<squaresCount+(sideborder/2)+1 && row<squaresCount+(sideborder/2)+1)==true) null
    else this.piece=false
    return this.piece!=false
}

}

// Export the Block class for use in other files.
module.exports={Block}
