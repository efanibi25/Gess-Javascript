import boardPiece from "./gessPiece.js";
import { data } from "../../scripts/lib/network.js";
import { getBlock } from "../utils/boardUtils.js";

// Constants
const color = 0xadd8e6;
const altColor = 0xD6D6B3;
const showblockColor = true;

export default class boardBlock extends Phaser.GameObjects.Rectangle {

    //--------------------------------------------------------------
    // ♟️ Constructor and Lifecycle
    // These methods handle the creation and destruction of the block.
    //--------------------------------------------------------------

    /**
     * @param {Phaser.Scene} scene The Phaser scene.
     * @param {number} x The x coordinate of the block.
     * @param {number} y The y coordinate of the block.
     * @param {number} width The width of the block.
     * @param {number} height The height of the block.
     * @param {number} row The row index of the block.
     * @param {number} col The column index of the block.
     * @param {number} index The unique index of the block.
     * @param {object} board A reference to the parent gessBoard object.
     */
    constructor(scene, x = 0, y = 0, width, height, row, col, index, board) {
        super(scene, x, y, width, height);
        this.row = row + 1;
        this.col = col + 1;
        this.width = width;
        this.height = height;
        this.gessBoard = board;
        this.piece = null;
        this.zone = null;
        this.text = null;
        this.index = index;
        
        // Data-related properties for neighbor lookup
        this.neighborsDexes = [
            0, -1, 1,
            -data["squaresCount"] - data["sideborder"],
            data["squaresCount"] + data["sideborder"],
            data["squaresCount"] + data["sideborder"] + 1,
            -data["squaresCount"] - data["sideborder"] - 1,
            data["squaresCount"] + data["sideborder"] - 1,
            -data["squaresCount"] - data["sideborder"] + 1
        ];
        
        this.addBlockColor();
        
        // Text properties
        this.fontSize = "20px";
        this.fontFamily = 'Georgia, "Goudy Bookletter 1911", Times, serif';
        this.fontStyle = 'bold';
    }

    /**
     * Destroys all associated game objects to prevent memory leaks.
     */
    destroyAll() {
        this.destroy();
        if (this.zone) this.zone.destroy();
        if (this.piece) this.piece.destroy();
        if (this.text) this.text.destroy();
    }
    
    //--------------------------------------------------------------
    // 🎨 Visual Modifications
    // These methods change the appearance of the block.
    //--------------------------------------------------------------

    /**
     * Sets the fill color of the block based on its row and column parity.
     */
    addBlockColor() {
        if (!showblockColor) {
            return;
        }
        if (Number.isInteger(this.row / 2) === false || Number.isInteger(this.col / 2) === false) {
            this.setFillStyle(altColor);
        } else {
            this.setFillStyle(color);
        }
    }

    /**
     * Makes the block invisible.
     */
    makeinvisible() {
        this.setFillStyle(0xffffff, 0);
    }
    
    //--------------------------------------------------------------
    // 🧱 Component Initialization
    // These methods add other game objects to the block.
    //--------------------------------------------------------------

    /**
     * Initializes and aligns a game piece within the block.
     * @returns {boardPiece} The newly created piece.
     */
    initPiece() {
        this.piece = new boardPiece(this.scene, 0, 0, this.width / 5, this.index, this);
        Phaser.Display.Align.In.Center(this.piece, this);
        return this.piece;
    }
}