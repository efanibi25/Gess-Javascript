// Import the pre-made instance directly from network.js
import network from './lib/network.js'; 
import UIManager from './lib/ui.js';
import BoardScene from '../phaser/scenes/board.js';

// This function runs once the entire HTML page is loaded and ready.
document.addEventListener('DOMContentLoaded', () => {
    
    const ui = UIManager;
    ui.initializeEventListeners();

    // --- 2. Socket Event Listeners ---
    
    network.socket.on("connect", () => {
        network.setSocketID(network.socket.id);
        
        // This is the key change: Automatically start the game.
        network.emit("creategame", network.gameID);
        ui.setAlert("Connection established. Creating game automatically...");
    });

    network.socket.on("disconnect", () => {
        ui.setAlert("Connection lost. Attempting to reconnect...");
    });

    network.socket.on("full", () => {
        window.location.href = '/full';
    });
    


    // --- 3. Phaser Game Setup ---

    let phaserGame = null;

    function startGame() {
        if (phaserGame) {
            return;
        }
        

        // const config = {
        //     type: Phaser.AUTO,
        //     width: 1600,
        //     height: 720,
        //     parent: 'game',
        //     transparent: true,
        //     scene: [ BoardScene ]
        // };
          const config = {
        type: Phaser.AUTO,
        
        // Use the container's actual width and height
        width: 1600,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        maxWidth:2560,
        maxHeight:1600,
        parent: 'game',
        transparent: true,
        
        scale: {
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        
        scene: [ BoardScene ]
    };

        phaserGame = new Phaser.Game(config);
        
        // Start the BoardScene, passing network and ui instances
        phaserGame.scene.start('BoardScene', { network, ui });
    }

    // Call startGame() to begin the process.
    startGame();
});