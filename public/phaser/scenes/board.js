import GessBoard from "../classes/gessBoard.js";
import { getDraggablePieces,getNeighborsOfPiece } from "../utils/boardUtils.js";
import { movePiece } from "../utils/gameLogic.js";

export default class BoardScene extends Phaser.Scene {
    /**
     * @param {object} config - The scene configuration.
     */
    constructor() {
        super('BoardScene');
    }

    // --- Phaser Lifecycle Methods ---

    /**
     * Initializes scene data.
     * @param {object} data - The data passed to the scene.
     * @param {NetworkManager} data.network - The network manager instance.
     * @param {UIManager} data.ui - The UI manager instance.
     */
    init(data) {
        this.network = data.network;
        this.ui = data.ui;
        this.gessBoard = null;
    }

    /**
     * Preloads assets required by the scene.
     */
    preload() {
        this.load.image('background', '../assets/wood.jpg');
    }

    /**
     * Creates the game objects and sets up listeners.
     */
    create() {
        this.add.image(0, 0, 'background').setOrigin(0);
        this.graphics = this.add.graphics();
        this.graphics.setDepth(5);
        this.setupSocketListeners();
        this.setupInputListeners();

        this.loadingText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'Waiting for game data...',
            { font: '24px Arial', fill: '#ffffff' }
        ).setOrigin(0.5);
    }

    // --- Socket Listeners ---

    /**
     * Sets up all socket event listeners for the game.
     */
    setupSocketListeners() {
        const socket = this.network.socket;
        socket.on("setplayerturntopic", (fullMessage) => {
    // This line correctly passes the full message as-is
    this.ui.setAlert(fullMessage);
});


        socket.on("setdata", (playerNum, boardMax, p1Pieces, p2Pieces, squaresCount, sideborder) => {
            console.log("CLIENT: ✅ Received 'setdata' event. Starting data processing and board creation.");

            this.processGameData(playerNum, boardMax, p1Pieces, p2Pieces, squaresCount, sideborder);
            this.initializeBoard();

            if (this.loadingText) {
                this.loadingText.destroy();
                this.loadingText = null;
            }
        });

        socket.on("winner", (player) => this.ui.setAlert(`${player} has won the game`));

        socket.on("sendalert", (message) => {
            let oldMessage = this.ui.getAlert();
            this.ui.setAlert(message);

            if (message === "The given move is not valid" || message === "The Piece is not valid") {
                setTimeout(() => {
                    this.ui.setAlert(oldMessage);
                }, 1500);
            }
        });

        socket.on("sendmove", (startdex, endex, test = true) => {
            if (this.gessBoard) {
                const gameData = this.network.data;
                movePiece(this.gessBoard.board, this.gessBoard.color, this, gameData, Phaser.Display, startdex, endex);
                if (test) {
                    this.network.emit("gamestate");
                    this.network.emit("checkrings", endex);
                }
            }
        });

        socket.on("enableinteractive", (change) => this._setPiecesInteractive(true));
        socket.on("disableinteractive", () => this._setPiecesInteractive(false));
       socket.on("playerstatus", (playerStatuses) => {
            if (playerStatuses && playerStatuses.length === 2) {
                const player1Status = playerStatuses[0].connected;
                const player2Status = playerStatuses[1].connected;
                this.ui.setPlayerStatus(player1Status, player2Status);
            }
        });

        socket.on("switchplayer", (num) => {
            this._switchplayer(num);
    });}

    // --- Board and UI Management ---

    /**
     * Processes initial game data received from the server.
     * @param {number} playerNum - The player's number.
     * @param {number} boardMax - The maximum index of the board.
     * @param {number[]} p1Pieces - The pieces for player 1.
     * @param {number[]} p2Pieces - The pieces for player 2.
     * @param {number} squaresCount - The number of squares on the board.
     * @param {number} sideborder - The size of the side border.
     */
    processGameData(playerNum, boardMax, p1Pieces, p2Pieces, squaresCount, sideborder) {
        this.network.setPlayerNumber(playerNum);
        this.network.setGameData("BoardMax", boardMax);
        this.network.setGameData("PLAYER1_PIECES", new Set(p1Pieces));
        this.network.setGameData("PLAYER2_PIECES", new Set(p2Pieces));
        this.network.setGameData("squaresCount", squaresCount);
        this.network.setGameData("sideborder", sideborder);
    }

    /**
     * Initializes the Gess board and its pieces.
     */
    initializeBoard() {
        if (!this.gessBoard) {
            const playerNumber = this.network.getPlayerNumber();
            const gameData = this.network.data;

            if (!gameData || isNaN(gameData.squaresCount) || isNaN(gameData.sideborder)) {
                console.error("Critical error: Game data is invalid or not yet received.");
                return;
            }

            try {
                this.gessBoard = new GessBoard(this, playerNumber, gameData);
                this.gessBoard.create();
                this.ui.setPlayerIndicator(playerNumber, this.gessBoard.color);
            } catch (error) {
                console.error("Error initializing board:", error);
                this.add.text(
                    this.cameras.main.width / 2,
                    this.cameras.main.height / 2,
                    'Error initializing game board',
                    { font: '24px Arial', fill: '#ff0000' }
                ).setOrigin(0.5);
            }
        }
    }

    // --- Input Listeners ---

    /**
     * Sets up all input-related event listeners for drag-and-drop.
     */
    setupInputListeners() {
        this.input.on('show-neighbors', this._showNeighbors, this);
        this.input.on('hide-neighbors', this._hideNeighbors, this);
        this.input.on('dragstart', this._handleDragStart, this);
        this.input.on('dragenter', (pointer, gameObject, dropZone) => {
            this._drawHighlight(dropZone);
        });

        this.input.on('dragleave', (pointer, gameObject, dropZone) => {
            this._clearHighlights();
            this._drawHighlight(gameObject.block.zone, 0x39FF33, 15);
        });

        this.input.on('drag', this._handleDrag, this);
        this.input.on('drop', (pointer, gameObject, dropZone) => {
            if (!this.gessBoard) return;
            gameObject.x = dropZone.x;
            gameObject.y = dropZone.y;
            gameObject.setNewBlock(dropZone.block);
            this._clearHighlights();
        });

        this.input.on('dragend', async (pointer, gameObject, dropped) => {
            if (!this.gessBoard) return;
            gameObject.normalSize();
            this._clearHighlights();
            try {
                const currentPlayer = await this.network.getCurrentPlayer(true);
                const playerNumber = this.network.getPlayerNumber();

                if (!dropped) {
        // Revert if the piece was not dropped on a valid zone
        this._revertPieceAndNeighbors(gameObject);
    } else {
        // Always send the move to the server for validation
        this.network.emit("sendmove", gameObject.block.index, gameObject.newBlock.index);
    }
            } catch (error) {
                console.error("Error in dragend handler:", error);
                this.ui.setAlert("Error processing move");
                this._revertPieceAndNeighbors(gameObject);
            }
        });
    }

    // --- Private Helper Methods ---

    /**
     * Reverts a piece and its neighbors to their original positions.
     * @param {Phaser.GameObjects.GameObject} gameObject - The game object (piece) to revert.
     */
    _revertPieceAndNeighbors(gameObject) {
        const gameData = this.network.data;
        const neighbors = getNeighborsOfPiece(this.gessBoard.board, gameData, gameObject);

        for (const key in neighbors) {
            const piece = neighbors[key];
            if (piece) {
                Phaser.Display.Align.In.Center(piece, piece.block);
            }
        }
    }

    /**
     * Enables or disables interactivity for draggable pieces.
     * @param {boolean} isInteractive - True to enable, false to disable.
     */
    _setPiecesInteractive(isInteractive) {
        if (!this.gessBoard) return
        const draggablePieces = getDraggablePieces(this.gessBoard.board, this.gessBoard.color);

        if (isInteractive) {
            console.log("CLIENT: Enabling player interaction.");
            draggablePieces.forEach(e => e.allowDraggable());
        } else {
            console.log("CLIENT: Disabling player interaction.");
            draggablePieces.forEach(e => e.disableDraggable());
        }
    }
   /**
 * Switches the client-side perspective to a different player.
 * THIS IS A TESTING/DEBUGGING FUNCTION ONLY.
 * It changes the client's internal color state and which pieces are considered draggable.
 * @param {number} playerNum - The player number to switch to (e.g., 1 or 2).
 */
_switchplayer(playerNum) {
    // Disable interactivity for the current player's pieces.
    this._setPiecesInteractive(false);
    
    // Update the gessBoard's internal state to the new player's perspective.
    this.gessBoard.player = `player${playerNum}`;
    this.gessBoard.setColor();
    
    // Enable interactivity for the new player's pieces.
    this._setPiecesInteractive(true);
}



    /**
     * Temporarily shows the neighbors of a piece.
     * @param {Phaser.GameObjects.GameObject} centerPiece - The central piece to show neighbors for.
     */
    _showNeighbors(centerPiece) {
        const gameData = this.network.data;
        const neighbors = getNeighborsOfPiece(this.gessBoard.board, gameData, centerPiece);
        Object.values(neighbors)
            .filter(p => p && p.owner === null)
            .forEach(p => p.setAlpha(0.5));
    }

    /**
     * Hides the neighbors of a piece.
     * @param {Phaser.GameObjects.GameObject} centerPiece - The central piece to hide neighbors for.
     */
    _hideNeighbors(centerPiece) {
        const gameData = this.network.data;
        const neighbors = getNeighborsOfPiece(this.gessBoard.board, gameData, centerPiece);
        Object.values(neighbors)
            .filter(p => p && p.owner === null)
            .forEach(p => p.setAlpha(0.01));
    }

    /**
     * Highlights the starting zone of a piece during a drag.
     * @param {Phaser.Input.Pointer} pointer - The input pointer.
     * @param {Phaser.GameObjects.GameObject} gameObject - The game object being dragged.
     */
    _highLightDragStart(pointer, gameObject) {
        this._clearHighlights();
        if (gameObject.block && gameObject.block.zone) {
            this._drawHighlight(gameObject.block.zone, 0x39FF33, 15);
        }
    }

    /**
     * Handles the start of a drag operation.
     * @param {Phaser.Input.Pointer} pointer - The input pointer.
     * @param {Phaser.GameObjects.GameObject} gameObject - The game object being dragged.
     */
    _handleDragStart(pointer, gameObject) {
        this._getStartPositions(pointer, gameObject);
        this._highLightDragStart(pointer, gameObject);
    }

    /**
     * Stores the initial positions of a piece and its neighbors.
     * @param {Phaser.Input.Pointer} pointer - The input pointer.
     * @param {Phaser.GameObjects.GameObject} gameObject - The game object being dragged.
     */
    _getStartPositions(pointer, gameObject) {
        gameObject.x_initial = gameObject.x;
        gameObject.y_initial = gameObject.y;

        if (gameObject.neighbors) {
            Object.values(gameObject.neighbors).filter(n => n != null).forEach(neighbor => {
                neighbor.x_initial = neighbor.x;
                neighbor.y_initial = neighbor.y;
            });
        }
    }

    /**
     * Handles the dragging of a piece and its neighbors.
     * @param {Phaser.Input.Pointer} event - The drag event.
     * @param {Phaser.GameObjects.GameObject} gameObject - The game object being dragged.
     */
    _handleDrag(event, gameObject) {
        let difX = event.position.x - gameObject.x;
        let difY = event.position.y - gameObject.y;
        let neighbors = getNeighborsOfPiece(this.gessBoard.board, this.network.data, gameObject);
        Object.values(neighbors).filter(e => e != null).forEach(ele => {
            ele.x = ele.x + difX;
            ele.y = ele.y + difY;
        });
    }

    /**
     * Clears all highlights from the board.
     */
    _clearHighlights() {
        this.graphics.clear();
    }

    /**
     * Draws a rectangular highlight around a specified zone.
     * @param {Phaser.Geom.Rectangle} zone - The zone to highlight.
     * @param {number} [color=0xffff00] - The color of the highlight.
     * @param {number} [thickness=12] - The thickness of the highlight line.
     */
    _drawHighlight(zone, color = 0xffff00, thickness = 12) {
        this.graphics.lineStyle(thickness, color);
        this.graphics.strokeRect(zone.x - zone.width / 2, zone.y - zone.height / 2, zone.width, zone.height);
    }
}