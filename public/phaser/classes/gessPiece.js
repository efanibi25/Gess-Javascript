/*
Piece Library
Note: Piece never change location only attributes based on grab events and validation of moves
*/
import { data } from "../../scripts/lib/network.js"


const lineThick=3
const lineColor=0xFF0000
const checkValidMove=true
const checkValidBlock=true
const showHidden=false
//alpha 0 disables interactivity
const hiddenAlpha=.01
const showAlpha=.5
const alertTimeout=2000
export default class boardPiece extends Phaser.GameObjects. Arc {

    /*
    Constructor and Initialization
    These functions handle the creation and initial setup of the piece.
    */
    constructor(scene,x=0,y=0,radius=50,index,block){
        super(scene, x, y,radius=Math.max(radius,7))
        this._radius=this.radius
        this.on('pointerdown', this.onPointerDown)
        this.on('pointerup', this.onPointerUp)
        this.scene.events.addListener('updatePiece', this.updatePiece,this);  
        this.owner=null
        this.index=index
        this.block=block
        this.gamePiece=true
  
    }
    
    /*
    State and Appearance Updates
    These functions are responsible for changing the piece's visual state based on its ownership or other game logic.
    */
    updatePiece(){
                if(this.owner==null){
                    this.setFillStyle(0xeb3434)
                    this.setAlpha(showHidden?1:hiddenAlpha)
        
                }
                else if(this.owner=="white"){
                    this.setFillStyle(0xffffff)
                    this.setStrokeStyle(lineThick,lineColor)
                    this.setAlpha(1)
        
                }
        
                else if(this.owner=="black"){
                    this.setFillStyle(0x000000)
                    this.setStrokeStyle(lineThick,lineColor)
                    this.setAlpha(1)
        
        
        
                }
        
            }

    updateOwner(owner) {
        this.owner = owner;
    
        if (this.owner === null) {
            // Style for an empty, inactive space
            this.setFillStyle(0x1a1a1a, 0.01); // Nearly invisible
            this.disableInteractive();
        } else if (this.owner === "white") {
            // Style for a white piece
            this.setFillStyle(0xffffff);
            this.setStrokeStyle(2, 0x000000); // Black outline
            this.setInteractive();
        } else if (this.owner === "black") {
            // Style for a black piece
            this.setFillStyle(0x000000);
            this.setStrokeStyle(2, 0xffffff); // White outline
            this.setInteractive();
        }
    }

    /*
    Interactivity and Dragging
    This group handles the piece's ability to be interacted with, specifically for dragging.
    */
    allowDraggable(){
        this.setInteractive( new Phaser.Geom.Rectangle(0 ,0, this.block.width*.8, this.block.height*.8), Phaser.Geom.Rectangle.Contains)
        // this.setInteractive();
        this.scene.input.setDraggable([this], true)
        Phaser.Display.Align.In.Center(this,this.block)
        this.draggable=true
    
        }

    disableDraggable(){
        this.disableInteractive()
        this.draggable=false
    }

    /*
    Pointer Events
    These functions are called when a user interacts with the piece using a pointer (e.g., mouse click, finger tap).
    */
    onPointerDown() {
        this.scene.children.bringToTop(this);
        this.shrink();
        
        // Emit a custom event to the scene, passing itself as a reference
        this.scene.events.emit('show-neighbors', this);
    }

    onPointerUp() {
        this.normalSize();
        
        // Emit another custom event to the scene
        this.scene.events.emit('hide-neighbors', this);
    }
    
    /*
    Size and Position Management
    These functions control the piece's size and its association with a game block.
    */
    shrink(){
        this.setRadius(Math.max(this.radius/4,2))
    }

    normalSize(){
        this.setRadius(Math.max(this._radius,7))
    }
    
    setNewBlock(block){
        this.newBlock=block
    }

    /*
    Game Logic and Validation
    This function checks if the piece is located within the main playing area of the board.
    */
    checkGamePiece(){
        let col=this.block.col
        let row=this.block.row
        if ((row>data["sideborder"]/2 && col>data["sideborder"]/2 && col<data["squaresCount"]+(data["sideborder"]/2)+1 && row<data["squaresCount"]+(data["sideborder"]/2)+1)==true) this.gamePiece=true
        else this.gamePiece=false
    }
}