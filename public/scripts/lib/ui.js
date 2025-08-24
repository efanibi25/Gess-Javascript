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
      alertBar.textContent = message;
    }
  },

  /**
   * Gets the current text from the alert bar.
   * @returns {string | null} The alert bar text, or null if the element is not found.
   */
  getAlert() {
    const alertBar = document.querySelector("#alertBar");
    return alertBar ? alertBar.textContent : null;
  },

  /**
   * Sets the player and color information in the player indicator element.
   * @param {string} player The player identifier (e.g., 'player1').
   * @param {string} color The player's color (e.g., 'white' or 'black').
   * @returns {void}
   */
  setPlayerIndicator(player, color) {
    const playerIndicator = document.querySelector("#playerindicator");
    if (playerIndicator && playerIndicator.children.length >= 2) {
      playerIndicator.children[0].textContent = `Player: ${player}`;
      playerIndicator.children[1].textContent = `Color: ${color || '-'}`;
    }
  }
};

export default UIManager;