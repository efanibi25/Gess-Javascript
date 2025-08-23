// BoardScene.js
import GessBoard from "../classes/gessBoard.js";

export default class BoardScene extends Phaser.Scene {
    constructor() {
        super('BoardScene');
    }

    init(data) {
        this.network = data.network;
        this.ui = data.ui;
        this.gessBoard = null;
    }
    
    preload() {
        this.load.image('background', '../assets/wood.jpg');
    }

    create() {
        this.add.image(0, 0, 'background').setOrigin(0);
        this.setupSocketListeners();
        this.setupInputListeners();

        this.loadingText = this.add.text(
            this.cameras.main.width / 2, 
            this.cameras.main.height / 2, 
            'Waiting for game data...', 
            { font: '24px Arial', fill: '#ffffff' }
        ).setOrigin(0.5);
    }

    setupSocketListeners() {
        const socket = this.network.socket;

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
        socket.on("sendalert", (message) => this.ui.setAlert(message));

        socket.on("sendmove", (startdex, endex, test = true) => {
            if (this.gessBoard) {
                this.gessBoard.movePieceAuto(startdex, endex);
                if (test) {
                    this.network.emit("gamestate");
                    this.network.emit("checkrings", endex);
                }
            }
        });
        socket.on("enableinteractive", () => this._setPiecesInteractive(true));
        socket.on("disableinteractive", () => this._setPiecesInteractive(false));
    }

    processGameData(playerNum, boardMax, p1Pieces, p2Pieces, squaresCount, sideborder) {
        this.network.setPlayerNumber(playerNum);
        this.network.setGameData("BoardMax", boardMax);
        this.network.setGameData("PLAYER1_PIECES", new Set(p1Pieces));
        this.network.setGameData("PLAYER2_PIECES", new Set(p2Pieces));
        this.network.setGameData("squaresCount", squaresCount);
        this.network.setGameData("sideborder", sideborder);
    }

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

    setupInputListeners() {
    // // FIX 1: Add a listener for the 'dragstart' event.
    this.input.on('dragstart', this._handleDragStart, this);

    // // This listener is now set up just one time.
    this.input.on('drag', this._handleDrag, this);        
    this.input.on('drop', (pointer, gameObject, dropZone) => {
            if (!this.gessBoard) return;
            
            gameObject.x = dropZone.x;
            gameObject.y = dropZone.y;
            gameObject.setNewBlock(dropZone.block);
            dropZone.removeZoneLine();
        });
        
        this.input.on('dragend', async (pointer, gameObject, dropped) => {
            if (!this.gessBoard) return;
            
            gameObject.normalSize();
            if (gameObject.block?.zone) {
                gameObject.block.zone.removeZoneLine();
            }

            try {
                const currentPlayer = await this.network.getCurrentPlayer(true);
                const playerNumber = this.network.getPlayerNumber();

                if (currentPlayer !== playerNumber) {
                    this.ui.setAlert(`It is not your turn`);
                    gameObject.revertNeighbors();
                } else if (!dropped) {
                    gameObject.revertNeighbors();
                } else {
                    this.network.emit("sendmove", gameObject.block.index, gameObject.newBlock.index);
                }
            } catch (error) {
                console.error("Error in dragend handler:", error);
                this.ui.setAlert("Error processing move");
                gameObject.revertNeighbors();
            }
        });
    }


    _setPiecesInteractive(isInteractive) {
        if (!this.gessBoard) return;

        const draggablePieces = this.gessBoard.getDraggablePieces();
        
        if (isInteractive) {
            console.log("CLIENT: Enabling player interaction.");
            draggablePieces.forEach(e => e.allowDraggable());
        } else {
            console.log("CLIENT: Disabling player interaction.");
            draggablePieces.forEach(e => e.disableDraggable());
        }
    }

    _handleDragStart(pointer, gameObject) {
    // Store the starting position of the main piece.
    gameObject.x_initial = gameObject.x;
    gameObject.y_initial = gameObject.y;

    // Also store the starting position of all its neighbors.
    if (gameObject.neighbors) {
        Object.values(gameObject.neighbors).filter(n => n != null).forEach(neighbor => {
            neighbor.x_initial = neighbor.x;
            neighbor.y_initial = neighbor.y;
        });
    }
}

    _handleDrag(event, gameObject) {
         let difX=event.position.x-gameObject.x
    let difY=event.position.y-gameObject.y
    gameObject.getNeighbors()
    Object.values(gameObject.neighbors).filter(e=>e!=null).forEach(ele=>{
        ele.x = ele.x+difX;
        ele.y = ele.y+difY;
    })
    }
}



