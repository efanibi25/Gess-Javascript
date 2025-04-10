
# Future Updates
The current UI is minimalistic.

Planned improvements:
- Modernize the interface using React or another front-end framework
- Integrate Phaser (which currently handles front-end rendering) with the new framework
- See detailed plans in: Documentation/future.md

# Live Demo
https://gess.fanibi.org/

# Installation & Setup

## 1. Redis Setup
You'll need a Redis instance running locally or on your server.

**Simplest method (using Docker):**
```bash
./start.sh  # This handles Redis setup automatically
```

## 2. Install Dependencies
```bash
npm install
npm install -g concurrently
npm instlal -g nodemon
```

## 3. Environment Configuration
Copy `.env.example` to `.env` in the root directory and update these values:

### Required Environment Variables
- `CLIENT_PORT`: Port for the main client UI/website (hosted by backend)
- `CLIENT_URL`: Domain/URL for client access
- `SOCKET_IO_PORT`: Port for Socket.IO service
- `SOCKET_IO_URL`: Domain/URL for Socket.IO access

### Optional Environment Variables
If not used socket.io will failback to http
- `PRIVATE_KEY`: SSL private key (generated via certbot or manually)
- `CERT_KEY`: SSL certificate key (generated via certbot or manually)

## 4. Launch Application
```bash
./start.sh
```
*For non-Docker Redis setups, modify the script as needed.*

## 5. Access the Application
The main website will be available at `localhost:8090` by default (port configurable in `.env`).
```

Key improvements:
1. Better organized sections
2. Consistent formatting for commands/code
3. More concise wording
4. Fixed grammatical issues
5. Added markdown formatting for better readability
6. Clarified some instructions
7. Removed redundant information

