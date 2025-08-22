class NetworkManager {
  constructor(serverUrl, gameKey) {
    // Use the key from the URL first, but fall back to localStorage
    this.gameID = this.setGameKey(gameKey) || this.getGameKey();
    this.data = { currentPlayer: null };

    // Use the URL constructor to ensure the server URL is always valid
    const socketUrl = new URL(serverUrl).href;
    
    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      path: "/socket.io/",
      query: { socketId: this.getSocketID() || '' },
            secure: window.location.protocol === "https:",

    });
  }

  // --- Event Emitters ---
  emit(event, ...args) {
    this.socket.emit(event, ...args);
  }

  emitPromise(event, ...args) {
    return new Promise((resolve) => {
      this.socket.timeout(5000).emit(event, ...args, (err, responseData) => {
        if (err || (responseData && responseData.error)) {
          console.error(`Error with event ${event}:`, err || responseData.error);
          resolve(null);
        } else if (responseData) {
          resolve(responseData.response);
        } else {
          resolve();
        }
      });
    });
  }

  // --- Local Storage Helpers ---
  
  // Manage the game key in localStorage
  getGameKey() {
    return localStorage.getItem('gameKey');
  }

  setGameKey(key) {
    if (key) {
      localStorage.setItem('gameKey', key);
      return key;
    }
    return null;
  }
  
  getSocketID() {
    return localStorage.getItem(`socketid_${this.gameID}`);
  }

  setSocketID(id) {
    if (this.gameID && !this.getSocketID()) {
      localStorage.setItem(`socketid_${this.gameID}`, id);
    }
  }

  getPlayerNumber() {
    return localStorage.getItem(`player_${this.gameID}`);
  }

  setPlayerNumber(num) {
    if (this.gameID && num != null) {
      localStorage.setItem(`player_${this.gameID}`, num);
    }
  }

  // --- Game Data Helpers ---
  setGameData(key, value) {
    this.data[key] = value;
  }

  async getCurrentPlayer(forced = false) {
    const player = await this.emitPromise("getcurrentplayer", forced);
    this.data.currentPlayer = player;
    return player;
  }
}

// Export a single instance of the manager
const networkManagerInstance = new NetworkManager(server, key);
export default networkManagerInstance;

// Export the data object for backward compatibility
export const data = networkManagerInstance.data;