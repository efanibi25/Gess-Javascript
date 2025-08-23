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
    
    network.socket.on("setplayerindicator", (player) => {
        ui.setAlert(`It is currently ${player}'s turn`);
    });

    // --- 3. Phaser Game Setup ---

    let phaserGame = null;

    function startGame() {
        if (phaserGame) {
            return;
        }
        
        const gameContainer = document.querySelector('#game');

        const config = {
            type: Phaser.AUTO,
            width: 1600,
            height: 720,
            parent: 'game',
            transparent: true,
            scene: [ BoardScene ]
        };

        phaserGame = new Phaser.Game(config);
        
        // Start the BoardScene, passing network and ui instances
        phaserGame.scene.start('BoardScene', { network, ui });
    }

    // Call startGame() to begin the process.
    startGame();
});