const UIManager = {
  // --- Properties ---
  /**
   * The initial height of the game element in viewport height (vh) units.
   * @type {number}
   */
  gameHeight: 85,

  // --- Methods ---
  /**
   * Initializes event listeners for the zoom buttons.
   * @returns {void}
   */
  initializeEventListeners() {
    const gameElement = document.querySelector("#game");
    const plusButton = document.querySelector("#plus-button");
    const minusButton = document.querySelector("#minus-button");

    if (!gameElement || !plusButton || !minusButton) {
      console.error("UI elements for zoom not found!");
      return;
    }

    plusButton.addEventListener("click", () => {
      this.gameHeight = this.gameHeight * 1.1;
      gameElement.style.height = `${this.gameHeight}vh`;
    });

    minusButton.addEventListener("click", () => {
      this.gameHeight = this.gameHeight / 1.1;
      gameElement.style.height = `${this.gameHeight}vh`;
    });

    console.log("Zoom button listeners initialized.");
  },

  /**
   * Sets the text of the alert bar.
   * @param {string} message The message to display.
   * @returns {void}
   */
   setAlert(message) {
    const alertBar = document.querySelector("#alertBar");
    if (alertBar) {
      // 1. Save the original message to a data attribute
      alertBar.dataset.originalMessage = message;

      // 2. Clear previous content
      alertBar.innerHTML = ''; 
      
      // 3. Split by newline and add text nodes with <br> tags
      const lines = message.split('\n');
      lines.forEach((line, index) => {
        const textNode = document.createTextNode(line);
        alertBar.appendChild(textNode);
        
        if (index < lines.length - 1) {
          const br = document.createElement('br');
          alertBar.appendChild(br);
        }
      });
    }
  },
  /**
   * Gets the current text from the alert bar.
   * @returns {string | null} The alert bar text, or null if the element is not found.
   */
  getAlert() {
    const alertBar = document.querySelector("#alertBar");
    // 4. Return the original message from the data attribute
    return alertBar ? alertBar.dataset.originalMessage : null;
  },
/**
 * Updates the text content of the player and color display using an object.
 * @param {object} playerData An object containing player details.
 * @param {string} playerData.player The player identifier (e.g., 'player1', 'player2').
 * @param {string} playerData.color The color string (e.g., 'white', 'black').
 */
setPlayerIndicator(player, color) {
  const playerNameDiv = document.querySelector("#yourPlayerName");
  const playerColorDiv = document.querySelector("#yourPlayerColor");

  // Exit if the required elements are not found
  if (!playerNameDiv || !playerColorDiv || !player || !color) {
    console.error('Invalid input or missing DOM elements for player indicator.');
    return;
  }
  
  let formattedPlayer;
  let formattedColor = color; // Assign color directly, as it's a separate argument now

  // Use a switch statement for clean conditional logic
  switch (player) {
    case 'player1':
      formattedPlayer = 'Player 1';
      break;
    case 'player2':
      formattedPlayer = 'Player 2';
      break;
    default:
      // Fallback for unexpected input
      formattedPlayer = player.charAt(0).toUpperCase() + player.slice(1);
      break;
  }

  // Update the DOM elements with the new values
  playerNameDiv.textContent = formattedPlayer;
  playerColorDiv.style.backgroundColor = formattedColor;
},
 
  
  /**

  
   * Updates the connection status dots for both players.
   * @param {boolean} player1Connected - True if Player 1 is connected.
   * @param {boolean} player2Connected - True if Player 2 is connected.
   */
  setPlayerStatus(player1Connected, player2Connected) {
    const player1Dot = document.querySelector("#player-status-1");
    const player2Dot = document.querySelector("#player-status-2");

    if (player1Dot) {
      player1Dot.classList.toggle('connected', player1Connected);
      player1Dot.classList.toggle('disconnected', !player1Connected);
    }

    if (player2Dot) {
      player2Dot.classList.toggle('connected', player2Connected);
      player2Dot.classList.toggle('disconnected', !player2Connected);
    }
  }
};

export default UIManager;