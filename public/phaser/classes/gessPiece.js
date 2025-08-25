/*
Piece Library
Note: Pieces never change location, only attributes based on grab events and validation of moves
*/
import { data } from "../../scripts/lib/network.js"


const lineThick = 3;
const lineColor = 0xFF0000;
const showHidden = false;
const hiddenAlpha = .01;
const showAlpha = .5;

export default class boardPiece extends Phaser.GameObjects.Arc {

    //--------------------------------------------------------------
    // ♟️ Constructor & Lifecycle
    // These methods handle the creation and initial setup of the piece.
    //--------------------------------------------------------------

    /**
     * @param {Phaser.Scene} scene The Phaser scene.
     * @param {number} x The x coordinate of the piece.
     * @param {number} y The y coordinate of the piece.
     * @param {number} radius The radius of the piece.
     * @param {number} index The index of the piece on the board.
     * @param {object} block A reference to the parent board block.
     */
    constructor(scene, x = 0, y = 0, radius = 50, index, block) {
        super(scene, x, y, radius = Math.max(radius, 7));
        this._radius = radius;
        this.on('pointerdown', this.onPointerDown);
        this.on('pointerup', this.onPointerUp);
        this.scene.events.addListener('updatePiece', this.updatePiece, this);
        this.owner = null;
        this.index = index;
        this.block = block;
        this.gamePiece = true;
    }

    /**
     * Cleans up the piece and its event listeners when destroyed.
     */
    destroy() {
        this.scene.events.removeListener('updatePiece', this.updatePiece, this);
        super.destroy();
    }
    
    //--------------------------------------------------------------
    // 🎨 Appearance & State Updates
    // These methods manage the piece's visual style and ownership.
    //--------------------------------------------------------------

    /**
     * Updates the piece's appearance based on its owner.
     * @param {string|null} owner The new owner of the piece ("white", "black", or null).
     */
    updateOwner(owner) {
        this.owner = owner;
        if (this.owner === null) {
            this.setFillStyle(0xeb3434);
            this.setAlpha(showHidden ? 1 : hiddenAlpha);
        } else if (this.owner === "white") {
            this.setFillStyle(0xffffff);
            this.setStrokeStyle(lineThick, lineColor);
            this.setAlpha(1);
        } else if (this.owner === "black") {
            this.setFillStyle(0x000000);
            this.setStrokeStyle(lineThick, lineColor);
            this.setAlpha(1);
        }
    }
    
    /**
     * A legacy method for updating the piece, now just calls the main update.
     */
    updatePiece() {
        this.updateOwner(this.owner);
    }

    /**
     * Shrinks the piece's visual size.
     */
    shrink() {
        this.setRadius(Math.max(this.radius / 4, 2));
    }

    /**
     * Restores the piece to its normal size.
     */
    normalSize() {
        this.setRadius(Math.max(this._radius, 7));
    }
    
    //--------------------------------------------------------------
    // ✋ Interactivity & Dragging
    // These methods control the piece's interactive behavior.
    //--------------------------------------------------------------

    /**
     * Enables draggable interaction for the piece.
     */
    allowDraggable() {
        this.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.block.width * .8, this.block.height * .8), Phaser.Geom.Rectangle.Contains);
        this.scene.input.setDraggable([this], true);
        Phaser.Display.Align.In.Center(this, this.block);
        this.draggable = true;
    }

    /**
     * Disables draggable interaction for the piece.
     */
    disableDraggable() {
        this.disableInteractive();
        this.draggable = false;
    }

    /**
     * Handles the pointer down event.
     */
    onPointerDown() {
        this.scene.children.bringToTop(this);
        this.shrink();
        this.scene.events.emit('show-neighbors', this);
    }

    /**
     * Handles the pointer up event.
     */
    onPointerUp() {
        this.normalSize();
        this.scene.events.emit('hide-neighbors', this);
    }

    //--------------------------------------------------------------
    // 📊 Data & State Logic
    // These methods handle the piece's data-driven state.
    //--------------------------------------------------------------
    
    /**
     * Assigns a new board block to the piece.
     * @param {object} block The new block to associate with the piece.
     */
    setNewBlock(block) {
        this.newBlock = block;
    }

    /**
     * Checks if the piece is within the main playable area of the board.
     */
    isGamePiece() {
        let col = this.block.col;
        let row = this.block.row;
        this.gamePiece = (row > data["sideborder"] / 2 && col > data["sideborder"] / 2 && col < data["squaresCount"] + (data["sideborder"] / 2) + 1 && row < data["squaresCount"] + (data["sideborder"] / 2) + 1);
    }
}