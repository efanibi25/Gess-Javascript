const {BoardMax,squaresCount,sideborder}=require("../res/player.js")
class block
{ 
    
constructor(index,row,col,board){
    this.index=index+1
    this.row=row+1
    this.col=col+1
    this.board=board
    this.piece=null
    
}

}

class piece{
    constructor(index,row,col){
        this.index=index+1
        this.row=row+1
        this.col=col+1
        this.neighborsDexes=[0,-1,1,-squaresCount-sideborder,
        squaresCount+sideborder,squaresCount+
        sideborder+1,-squaresCount-sideborder-1,
        squaresCount+sideborder-1,-squaresCount-
        sideborder+1]
        this.owner=null
    } 

    getNeighbors(){
        let out={}
        for (const ele of this.neighborsDexes){
            let piece=this.block.board.getPiece(this.index+ele)
            out[ele]=piece   
        }
        this.neighbors=out
        return out
        }
    
}


class board{
    constructor(pieces,opponent,number){
        this.myPieces=new Set(pieces)
        this.opponentPieces=new Set(opponent)
        this.board=[]
        this.createBoard()
        this.addPieces()
        this.number=number
    }

    validate(start,end){
        let startblock=this.getBlock(start)
        let endblock=this.getBlock(end)
        if(this.testValidBlock(startblock)==false){
            return false
        }
      
        
        
    }

    testValidBlock(startblock){
        let valid=true
        startblock.getNeighbors()

    
        if(Object.values(this.neighbors)
            .filter(ele=>ele.owner==this.block.board.otherColor).length>0){
            document.querySelector("#alertBar").textContent="Can't Move Block With Opponent Pieces"
            valid=false
            setTimeout(()=> data["currentplayer"], alertTimeout);
        }

        else if(Object.values(this.neighbors)
        .filter(ele=>ele.owner!="out").length!=9){
        document.querySelector("#alertBar").textContent="Block Must Have 9 Pieces"
        valid=false
        setTimeout(()=> data["currentplayer"], alertTimeout);
    }

        else if(Object.values(this.neighbors).filter(ele=>ele.owner==this.block.board.color).length==0){
            document.querySelector("#alertBar").textContent="Can't Move Block With No Pieces"
            valid=false
            setTimeout(()=> data["currentplayer"], alertTimeout);
        }

        return valid
    }








    getDir(startblock,endblock){
        let rowchange=endblock.row-startblock.row
        let colchange=endblock.col-startblock.col
        if(colchange==0 && rowchange==0){
            return 0
        }
        else if(colchange==0 && rowchange>=1){
            return squaresCount+sideborder
        }
        else if(colchange==0 && rowchange<0){
            return -squaresCount-sideborder
        }
      
        else if(rowchange==0 && colchange>=1){
            return 1
        }
    
        else if(rowchange==0 && colchange<0){
            return -1
        }
    
        else if(Math.abs(rowchange)!=Math.abs(colchange)){
            return
        }
      
    
        else if(rowchange<0 && colchange<0){
            return -squaresCount-sideborder-1
        }
    
    
        else if(rowchange<0 && colchange>0){
            return -squaresCount-sideborder+1
        }
    
        else if(rowchange>0 && colchange<0){
            return squaresCount+sideborder-1
        }
    
    
        else if(rowchange>0 && colchange>0){
            return squaresCount+sideborder+1
        }  
    }

    
    createBoard(){
        let i=0
        let k=0
        let count=0
        while ( i< squaresCount+sideborder) {
            k=0
            while ( k< squaresCount+sideborder) {
                this.board.push(new block(count,i,k,this))
                count=count+1
                k=k+1
            }
            i=i+1
        }
    }










    addPieces(){
        let i=0
        let k=0
        let count=0
        let gamePieceCount=1
        while ( i< Math.pow(squaresCount+sideborder,2)) { 
            let k=0
            while ( k< squaresCount+sideborder) {
                if ((i<(sideborder/2) || k<(sideborder/2) || i>=squaresCount+(sideborder/2) || k>=squaresCount+(sideborder/2))==false){
                    this.board[i].piece= new piece(count,i,k)
                    let boardpiece=this.board[i].piece
                    if(this.myPieces.has(gamePieceCount)){
                        boardpiece.owner="mine"
                    }

                    else if(this.opponentPieces.has(gamePieceCount)){
                        boardpiece.owner="opponent"
                    }
                
                    gamePieceCount=gamePieceCount+1
                }
                count=count+1

                k=k+1

            }
            i=i+1
        }    
                
            }

        
    


    getBlock(index){
        if (index<0) return 
        else if (index>=BoardMax) return 
        return this.board[index-1]
    }

    getPiece(index){
    let block=this.getBlock(index)
    if(block){
        return block.piece
    }
    return block
}
}
    








module.exports={board}