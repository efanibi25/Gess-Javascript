class NetworkManager {
    /**
     * Manages all network communication with the game server.
     * @param {string} serverUrl The URL of the Socket.IO server.
     * @param {string} gameKey The unique key for the game.
     */
    constructor(serverUrl, gameKey) {
        // --- Game and Session State ---
        // Prioritize the game key from the URL, but fall back to localStorage.
        this.gameID = this.setGameKey(gameKey) || this.getGameKey();
        this.data = { currentPlayer: null };

        // --- Socket.IO Connection ---
        // Use the URL constructor for robust URL parsing.
        const socketUrl = new URL(serverUrl).href;

        this.socket = io(socketUrl, {
            transports: ['websocket', 'polling'],
            path: "/socket.io/",
            query: { socketId: this.getSocketID() || '' },
            secure: window.location.protocol === "https:",
        });
    }

    // --- Public API: Event Emitters ---
    /**
     * Emits an event to the server.
     * @param {string} event The name of the event to emit.
     * @param {...any} args The arguments to send with the event.
     */
    emit(event, ...args) {
        this.socket.emit(event, ...args);
    }

    /**
     * Emits an event and returns a Promise that resolves with the server's response.
     * @param {string} event The name of the event to emit.
     * @param {...any} args The arguments to send with the event.
     * @returns {Promise<any | null>} A promise resolving to the server's response data or null on error.
     */
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

    /**
     * Fetches the current player's turn from the server.
     * @param {boolean} [forced=false] Force a refresh of the player state.
     * @returns {Promise<any>} The current player data.
     */
    async getCurrentPlayer(forced = false) {
        const player = await this.emitPromise("getcurrentplayer", forced);
        this.data.currentPlayer = player;
        return player;
    }

    // --- Public API: Game Data Helpers ---
    /**
     * Sets a key-value pair in the local game data object.
     * @param {string} key The data key.
     * @param {any} value The value to store.
     */
    setGameData(key, value) {
        this.data[key] = value;
    }

    /**
     * Retrieves the player number from local storage.
     * @returns {string | null} The player number as a string, or null if not found.
     */
    getPlayerNumber() {
        return localStorage.getItem(`player_${this.gameID}`);
    }

    /**
     * Sets the player number in local storage.
     * @param {string} num The player's number.
     */
    setPlayerNumber(num) {
        if (this.gameID && num != null) {
            localStorage.setItem(`player_${this.gameID}`, num);
        }
    }

    // --- Local Storage Helpers ---
    /**
     * Retrieves the game key from local storage.
     * @returns {string | null} The game key or null if not found.
     */
    getGameKey() {
        return localStorage.getItem('gameKey');
    }

    /**
     * Sets the game key in local storage if it's provided.
     * @param {string} key The game key.
     * @returns {string | null} The key or null if not provided.
     */
    setGameKey(key) {
        if (key) {
            localStorage.setItem('gameKey', key);
            return key;
        }
        return null;
    }

    /**
     * Retrieves the socket ID from local storage for the current game.
     * @returns {string | null} The socket ID or null if not found.
     */
    getSocketID() {
        return localStorage.getItem(`socketid_${this.gameID}`);
    }

    /**
     * Sets the socket ID in local storage if a game ID is present.
     * @param {string} id The socket ID.
     */
    setSocketID(id) {
        if (this.gameID && !this.getSocketID()) {
            localStorage.setItem(`socketid_${this.gameID}`, id);
        }
    }
}

// Export a single instance of the manager
const networkManagerInstance = new NetworkManager(server, key);
export default networkManagerInstance;

// Export the data object for backward compatibility
export const data = networkManagerInstance.data;