import GessBoard from "../classes/board.js";

export default class BoardScene extends Phaser.Scene {
    constructor() {
        super('BoardScene');
    }

    // The 'network' and 'ui' managers are received here from game.js
    init(data) {
        this.network = data.network;
        this.ui = data.ui;
    }

    preload() {
        this.load.image('background', '../assets/wood.jpg');
    }

    create() {
        // --- Setup Scene ---
        this.add.image(0, 0, 'background').setOrigin(0);
        
        const playerNumber = this.network.getPlayerNumber();
        this.gessBoard = new GessBoard(this, playerNumber);
        this.gessBoard.create();
        
        // Update the UI using the UIManager
        this.ui.setPlayerIndicator(playerNumber, this.gessBoard.color);
        
        // --- Setup Socket Listeners for THIS Scene ---
        this.setupSocketListeners();

        // --- Setup Phaser Input Listeners for THIS Scene ---
        this.setupInputListeners();
        
        // Let the server know the scene is ready
        this.network.emit("gamestate");
    }

    setupSocketListeners() {
        const socket = this.network.socket; // Get the socket instance from the manager

        socket.on("winner", (player) => {
            this.ui.setAlert(`${player} has won the game`);
        });

        socket.on("sendalert", (message) => {
            this.ui.setAlert(message);
        });

        socket.on("sendmove", (startdex, endex, test = true) => {
            this.gessBoard.movePieceAuto(startdex, endex);
            if (test) {
                this.network.emit("gamestate");
                this.network.emit("checkrings", endex);
            }
        });

        socket.on("enableinteractive", () => {
            this.gessBoard.getDraggablePieces().forEach(e => e.allowDraggable());
        });

        socket.on("disableinteractive", () => {
            this.gessBoard.getDraggablePieces().forEach(e => e.disableDraggable());
        });
    }

    // This method belongs inside your BoardScene class in public/phaser/scenes/board.js

setupInputListeners() {
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
        // This logic handles moving the piece and its neighbors while dragging
        let difX = dragX - gameObject.x;
        let difY = dragY - gameObject.y;
        
        // Ensure neighbors are calculated
        if (!gameObject.neighbors) {
            gameObject.getNeighbors();
        }
        
        Object.values(gameObject.neighbors).filter(e => e != null).forEach(neighbor => {
            neighbor.x += difX;
            neighbor.y += difY;
        });
    });

    this.input.on('drop', (pointer, gameObject, dropZone) => {
        // Snap the piece to the center of the drop zone
        gameObject.x = dropZone.x;
        gameObject.y = dropZone.y;
        gameObject.setNewBlock(dropZone.block);

        // FIX: Explicitly remove the highlight from the zone it was dropped on.
        dropZone.removeZoneLine();
    });
    
    this.input.on('dragend', async (pointer, gameObject, dropped) => {
        // FIX: Reset the piece's size regardless of the outcome.
        gameObject.normalSize();

        // FIX: Remove the green highlight from the starting block's zone.
        if (gameObject.block && gameObject.block.zone) {
            gameObject.block.zone.removeZoneLine();
        }

        const currentPlayer = await this.network.getCurrentPlayer(true);
        const playerNumber = this.network.getPlayerNumber();

        if (currentPlayer !== playerNumber) {
            this.ui.setAlert(`It is not your turn`);
            gameObject.revertNeighbors(); // This function should reset the piece's position
        } else if (!dropped) {
            // If not dropped on a valid zone, revert position.
            gameObject.revertNeighbors();
        } else {
            // If successfully dropped, emit the move to the server.
            this.network.emit("sendmove", gameObject.block.index, gameObject.newBlock.index);
        }
    });
}
}