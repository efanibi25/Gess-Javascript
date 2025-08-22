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
npm install -g concurrently nodemon
```

## 3. Environment Configuration
Copy `conf/.env.example` to `.env` in the root directory and update these values:

### Required Environment Variables
- `CLIENT_PORT`: Port for the main client UI/website (hosted by backend)
- `CLIENT_URL`: Domain/URL for client access

### Optional SSL Configuration
Socket.IO will fall back to HTTP if these are not provided:
- `PRIVATE_KEY`: SSL private key (generated via certbot or manually)
- `CERT_KEY`: SSL certificate key (generated via certbot or manually)

### Nginx Configuration Examples
- `conf/gess.certbot.conf`: Example configuration for Certbot setup
- `conf/gess.conf`: Plain HTTP connection configuration

## 4. Launch Application
```bash
./start.sh
```
*Note: For non-Docker Redis setups, modify the script as needed.*

## 5. Access the Application
The main website will be available at `localhost:8090` by default (port configurable in `.env`).

