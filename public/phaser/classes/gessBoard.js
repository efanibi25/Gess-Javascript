import boardBlock from "./gessBlock.js";
import { data } from "../../scripts/lib/network.js";

import { getOtherPlayerPieces, getMyPieces } from "../utils/gameUtils.js";
import { getNeighborsOfBlock } from "../utils/boardUtils.js";
import Zone from "./gessZone.js";

// --- Constants ---
const stroke = 8;
const showStroke = true;
const showZoneLine = false;

const fontSize = "20px";
const fontFamily = 'Georgia, "Goudy Bookletter 1911", Times, serif';
const fontStyle = 'bold';


export default class gessBoard extends Phaser.GameObjects.Container {
    /**
     * Creates a new Gess game board.
     * @param {Phaser.Scene} scene The Phaser scene.
     * @param {string} player The current player ('player1' or 'player2').
     * @param {object} gameData The game data.
     */
    constructor(scene, player, gameData) {
        super(scene, 0, 0);

        // --- Board Configuration ---
        this.chessboardOffsetX = 10;
        this.chessboardOffsetY = 10;
        this.canvas = scene.game.canvas;
        this.width = (this.canvas.width - this.chessboardOffsetX);
        this.height = (this.canvas.height - this.chessboardOffsetY);
        this.squareSize = Math.floor(Math.min((this.width / data["squaresCount"]), (this.height / (data["squaresCount"] + data["sideborder"]))));
        this.board = [];

        // --- Properties ---
        this.player = player;
        this.setColor();
        this.gameData = gameData;
        this.rings = [];
    }

    // --- Game Lifecycle Methods ---

    /**
     * Initializes and creates the game board and pieces.
     * This method should be called after the constructor.
     */
    create() {
        this.createBoard();
        this.upDateGameBlocks();
        this.scene.add.existing(this);
    }

    /**
     * Destroys all board blocks and the container.
     */
    destroyAll() {
        this.destroy();
        this.board.forEach(e => e.destroyAll());
    }

    // --- Board Creation ---

    /**
     * Creates and aligns the `boardBlock` objects in a grid.
     */
    createBoard() {
        this.extendBoardArray();
        Phaser.Actions.GridAlign(this.board, {
            width: data["squaresCount"] + data["sideborder"],
            height: data["squaresCount"] + data["sideborder"],
            x: this.chessboardOffsetX / 2 + (this.width / 2) - (this.squareSize * (data["squaresCount"] + data["sideborder"]) / 2),
            y: this.chessboardOffsetY / 2,
            cellWidth: this.squareSize,
            cellHeight: this.squareSize
        });
    }

    /**
     * Populates the board array with `boardBlock` instances.
     * Marks border blocks as invisible.
     */
    extendBoardArray() {
        const totalSize = data.squaresCount + data.sideborder;
        let blockCount = 0;
        
        for (let row = 0; row < totalSize; row++) {
            for (let col = 0; col < totalSize; col++) {
                const rect = new boardBlock(this.scene, 0, 0, this.squareSize, this.squareSize, row, col, blockCount, this);
                blockCount++;
                
                const isBorder = (row < data.sideborder / 2 || col < data.sideborder / 2 || 
                                  row >= data.squaresCount + data.sideborder / 2 || col >= data.squaresCount + data.sideborder / 2);
                
                if (isBorder) {
                    rect.makeinvisible();
                    if (showStroke) rect.setStrokeStyle(stroke, 0x0000FF);
                } else {
                    if (showStroke) rect.setStrokeStyle(stroke, 0x000000);
                }
                
                this.board.push(rect);
                this.add(rect);
            }
        }
    }

    // --- Piece & Zone Management ---

    /**
     * Updates the game board with pieces based on the current game state.
     */
    upDateGameBlocks() {
        const otherPlayerPieces = getOtherPlayerPieces(this.player);
        const myPieces = getMyPieces(this.player);
        const totalSize = Math.pow(data.squaresCount + data.sideborder, 2);

        // First loop: Initialize pieces and add labels.
        for (let i = 0; i < totalSize; i++) {
            const block = this.board[i];
            block.index = i + 1;
            this.add(block.initPiece());

            if (block.col === data.sideborder / 2) {
                this.addBlockNum(block, block.row);
            } else if (block.row === data.sideborder / 2) {
                this.addBlockText(block, block.col);
            }
        }

        // Second loop: Check for game pieces, assign ownership, and add zones.
        for (let i = 0; i < totalSize; i++) {
            const block = this.board[i];
            const piece = block.piece;
            piece.checkGamePiece();

            if (piece.gamePiece) {
                this.addZone(block);
                
                if (myPieces.has(block.index)) {
                    piece.owner = this.color;
                } else if (otherPlayerPieces.has(block.index)) {
                    piece.owner = this.otherColor;
                }
            }
        }
        
        this.scene.events.emit('updatePiece');
    }

    /**
     * Adds a Zone object to a board block if it's surrounded by neighbors.
     * @param {boardBlock} block The block to add the zone to.
     */
    addZone(block) {
        // Correctly get neighbors by passing the board and the block's index
        const neighbors = getNeighborsOfBlock(this.board, block.index);

        // Check if the block is surrounded by all 8 neighbors
        if (Object.values(neighbors).filter(e => e !== null).length === 9) {
            // Create the zone using the block's position and dimensions
            block.zone = new Zone(this.scene, block.x, block.y, block.width, block.height, block);
            
            // Align the zone to the block. The `this` in your original code was incorrect
            Phaser.Display.Align.In.Center(block.zone, block);
            
            // Optional: Draw a debug highlight
            if (showZoneLine) {
                this.scene._drawHighlight(block.zone, zoneColor, zoneLineThick);
            }
            
            // Return the created zone so gessBoard can add it to its container
            return block.zone;
        }
        
        // Return null if no zone was created
        return null;
    }

    // --- Helper Methods ---

    /**
     * Sets the player's color and the opponent's color.
     */
    setColor() {
        if (this.player == "player1") {
            this.color = "white";
            this.otherColor = "black";
        } else {
            this.color = "black";
            this.otherColor = "white";
        }
    }

    /**
     * Adds a numerical label to a border block.
     * @param {boardBlock} block The block to add the number to.
     * @param {number} num The row number.
     */
    addBlockNum(block, num) {
        block.text = new Phaser.GameObjects.Text(this.scene, 0, 0, num - data["sideborder"] / 2 + 1, {
            fontFamily: fontFamily,
            fontSize: fontSize,
            fontStyle: fontStyle
        });
        this.scene.add.existing(block.text);
        Phaser.Display.Align.In.Center(block.text, block);
    }

    /**
     * Adds an alphabetical label to a border block.
     * @param {boardBlock} block The block to add the letter to.
     * @param {number} num The column number.
     */
    addBlockText(block, num) {
        if (num <= data["sideborder"] / 2 || num > (data["sideborder"] / 2) + data["squaresCount"]) {
            block.text = new Phaser.GameObjects.Text(this.scene, 0, 0, "*", {
                fontFamily: fontFamily,
                fontSize: fontSize,
                fontStyle: fontStyle
            });
        } else {
            block.text = new Phaser.GameObjects.Text(this.scene, 0, 0, String.fromCharCode(63 + num - data["sideborder"] / 2 + 1), {
                fontFamily: fontFamily,
                fontSize: fontSize,
                fontStyle: fontStyle
            });
        }
        this.scene.add.existing(block.text);
        Phaser.Display.Align.In.Center(block.text, block);
    }
}