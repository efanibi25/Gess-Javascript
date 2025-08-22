const UIManager = {
  // --- Properties ---
  gameHeight: 85, // Initial height in vh units

  // --- Methods ---
  initializeEventListeners() {
    const gameElement = document.querySelector("#game");
    const plusButton = document.querySelector("#plus-button");
    const minusButton = document.querySelector("#minus-button");

    if (!gameElement || !plusButton || !minusButton) {
      console.error("UI elements for zoom not found!");
      return;
    }

    // Use arrow functions to automatically bind 'this'
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

  setAlert(message) {
    const alertBar = document.querySelector("#alertBar");
    if (alertBar) alertBar.textContent = message;
  },

  setPlayerIndicator(player, color) {
    const playerIndicator = document.querySelector("#playerindicator");
    if (playerIndicator) {
        playerIndicator.children[0].textContent = `Player: ${player}`;
        playerIndicator.children[1].textContent = `Color: ${color || '-'}`;
    }
  }
};

export default UIManager;