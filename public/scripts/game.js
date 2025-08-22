// Import the pre-made instance directly from network.js
import network from './lib/network.js'; 
import UIManager from './lib/ui.js';
import BoardScene from '../phaser/scenes/board.js';

// This function runs once the entire HTML page is loaded and ready.
document.addEventListener('DOMContentLoaded', () => {
    
    
    const ui = UIManager;
    ui.initializeEventListeners();

    // --- 2. Socket Event Listeners ---
    // We can immediately start using the imported 'network' object
    
    network.socket.on("connect", () => {
        network.setSocketID(network.socket.id);
        network.emit("creategame", network.gameID); // Use network.gameID
        ui.setAlert("Waiting for another player...");
    });

    network.socket.on("disconnect", () => {
        ui.setAlert("Connection lost. Attempting to reconnect...");
    });

    network.socket.on("full", () => {
        window.location.href = '/full';
    });
    
    network.socket.on("setdata", async (playerNum, boardMax, p1Pieces, p2Pieces, squaresCount, sideborder) => {
        network.setPlayerNumber(playerNum);
        
        network.setGameData("BoardMax", boardMax);
        network.setGameData("PLAYER1_PIECES", new Set(p1Pieces));
        network.setGameData("PLAYER2_PIECES", new Set(p2Pieces));
        network.setGameData("squaresCount", squaresCount);
        network.setGameData("sideborder", sideborder);

        ui.setPlayerIndicator(playerNum);
        await startGame();
    });

    network.socket.on("setplayerindicator", (player) => {
        ui.setAlert(`It is currently ${player}'s turn`);
    });

    // --- 3. Phaser Game Setup ---

    let phaserGame = null;

    async function startGame() {
        if (phaserGame) {
            phaserGame.scene.getScene('BoardScene').scene.restart({ network, ui });
            return;
        }
        
     // Get the container element for the game
    const gameContainer = document.querySelector('#game');

    const config = {
        type: Phaser.AUTO,
        
        // Use the container's actual width and height
        width: gameContainer.clientWidth,
        height: gameContainer.clientHeight,
        
        parent: 'game',
        transparent: true,
          width: 1920,
    height: 800,
        scene: [ BoardScene ]
    };

    phaserGame = new Phaser.Game(config);
    phaserGame.scene.start('BoardScene', { network, ui });
    }
});