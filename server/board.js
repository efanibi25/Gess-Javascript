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

class piece{
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

    checkRing(){
            this.getNeighbors()
        
            if(this.owner==null){
                return Object.values(this.neighbors).filter( ele=>ele!=null&&ele.index!=this.index && ele.owner=="mine").length==8
            }
            return false
        }

   
    
}


class board{
    constructor(pieces,rings,opponent,number){
        this.myPieces=new Set(pieces)
        this.opponentPieces=new Set(opponent)
        this.rings=new Set(rings)
        this.board=[]
        this.createBoard()
        this.addPieces()
        this.number=number
    }
    //action
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

    //rings

    
    
    updateRings(index){
        let rings=[...this.rings,...input].filter((e)=>e=!null)
        this.rings=new Set(rings.filter(e=>e.checkRing()==true))
        return this.ring
      }

    addPieces(){
        let i=0
        while ( i< Math.pow(squaresCount+sideborder,2)) { 
            let block=this.board[i]
            if(block.checkGamePiece()){
                block.piece= new piece(block.index,block.row,block.col,this)
                if(this.myPieces.has(i+1)){
                    block.piece.owner="mine"
                }
                else if(this.opponentPieces.has(i+1)){
                    block.piece.owner="opponent"
                }
            
            }
            i=i+1


        }    
                
            }
    //validation

    validatePiece(start){
        let startblock=this.getBlock(start)
        if(this.testValidBlock(startblock)==false){
            return false
        }
        return true  
        
    }

    testValidBlock(startblock){
        if (!startblock.piece){
            return false
        }
        startblock.piece.getNeighbors()

    
        if(Object.values(startblock.piece.neighbors)
            .filter(ele=>ele.owner=="opponent").length>0){
                console.log("can't move opponent pieces")
        return false
            }

        else if(Object.values(startblock.piece.neighbors)
        .filter(ele=>ele.piece==false).length>0){
        console.log("block Must Have 9 game blocks")
        return false
    }

        else if(Object.values(startblock.piece.neighbors).filter(ele=>ele.piece!=false).length==0){
            console.log("Can't Move Block With No Pieces")
            return false
        }

        return true
    }

    validateMove(start,end){
    let dir=this.getDir(start,end)
    let startblock=this.getBlock(start)
    if (dir==0){
        console.log("You must Move at least 1 block")  
        return false
    }
    else if (dir==null){
        console.log("invalid movemeent")
        return false
    }
    else if (startblock.piece.neighbors[dir].owner==null ){
        console.log("The Given Direction does not have a piece")
        return false
    }

    else if (startblock.piece.neighbors[dir].owner=="opponent" ){
        console.log("The Given Direction has the opponent piece")
        return false
    }
    else if(startblock.piece.neighbors[dir].owner==null && Math.abs((start-end)/dir)>3){
        return false;    
    }
    return true
    }
//update
    updateBoard(start,end){
        let update=this.updateSets(start,end)
        this.updatePieces(start,end)
        return update
    }

    updatePieces(start,end){
        let startblock=this.getBlock(start)
        let endblock=this.getBlock(end)

        let colordict={}

        //save info
        for(const key of Object.keys(startblock.piece.getNeighbors())){
            colordict[key]=startblock.piece.neighbors[key].owner
        }
        //clear board
        for(const val of Object.values(startblock.piece.getNeighbors())){
            val.owner=null
        }

        for(const val of Object.values(endblock.piece.getNeighbors()).filter(e=>e.owner=="opponent")){
            val.owner=null
        }

        Object.keys(colordict).filter(key=>colordict[key]!=null).forEach(key=>{
            let piece= this.getPiece(end+parseInt(key))
            if(piece)piece.owner=colordict[key]
        }
            
    )
        

    }

    updateSets(start,end){
        let startblock=this.getBlock(start)
        let endblock=this.getBlock(end)
        
        startblock.piece.getNeighbors()
        endblock.piece.getNeighbors()
        let colordict={}

        //save info
        for(const key of Object.keys(startblock.piece.neighbors)){
            colordict[key]=startblock.piece.neighbors[key].owner
        }
        //clear board
        
        for(const val of Object.values(startblock.piece.neighbors)){
            this.myPieces.delete(val.index)
        }

        for(const val of Object.values(endblock.piece.neighbors).filter(e=>e.owner=="opponent")){
            this.opponentPieces.delete(val.index)
        }

        //restore
        for(const key of Object.keys(colordict)){
            if(colordict[key]=="mine"){
                this.myPieces.add(endblock.piece.neighbors[key].index)
            }
          
        }

        if(this.number==1){
            return {"player2Pieces":Array.from(this.opponentPieces),"player1Pieces":Array.from(this.myPieces)}

        }
        else{
            return {"player1Pieces":Array.from(this.opponentPieces),"player2Pieces":Array.from(this.myPieces)}

        }
        
    
    }
    //position

    getMaxMovement(start,end){
        let positions=this.getMovementsHelper(start,end)
        let startpiece=this.getPiece(start)
        let excluded_indexes=new Set(Object.values(startpiece.neighbors).map(e=>e.index))
        startpiece.getNeighbors()
  
        for(let current of positions){
            for(let key of  Object.keys(startpiece.neighbors))

            {
                if(startpiece.neighbors[key].owner==null) continue
                else if (excluded_indexes.has(current+parseInt(key))) continue
                else if (this.myPieces.has(current+parseInt(key)||this.opponentPieces.has(current+parseInt(key)))) return current
            }
           
    
        }
           

        return end  
        

      }
    



getMovementsHelper(start,end){
    let dir=this.getDir(start,end)
    let positions=[]

if(dir>0){
    for(let current=start+dir;current<end;current=current+dir){
        positions.push(current)

      }
  }
  else{
    for(let current=start+dir;current>end;current=current+dir){
        positions.push(current)

      }
  }
  return positions

}

    getDir(start,end){
        let startblock=this.getBlock(start)
        let endblock=this.getBlock(end)
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

    
//data
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