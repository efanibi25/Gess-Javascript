import express from 'express';
import { createServer as createHttpServer } from 'http';
import { createServer as createHttpsServer } from 'https';
import fs from 'fs';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import session from 'express-session';
import exphbs from 'express-handlebars';
import mainRoutes from './routes/mainRoutes.js';
import initializeSockets from './sockets/socketHandler.js';

// --- Basic Setup ---
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- HTTPS/HTTP Server Initialization ---
let httpServer;

// Check .env for SSL key paths
if (process.env.PRIVATE_KEY && process.env.CERT_KEY) {
  try {
    const credentials = {
      key: fs.readFileSync(process.env.PRIVATE_KEY),
      cert: fs.readFileSync(process.env.CERT_KEY)
    };
    httpServer = createHttpsServer(credentials, app);
    console.log("✅ Starting in secure HTTPS mode.");
  } catch (e) {
    console.error("❌ Error reading SSL certificates. Falling back to HTTP.", e);
    httpServer = createHttpServer(app);
  }
} else {
  console.log("⚠️ Starting in insecure HTTP mode. (SSL keys not found in .env)");
  httpServer = createHttpServer(app);
}

// --- Attach Socket.IO ---
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"],
  },
  path: "/socket.io/"
});

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 }
}));


// --- View Engine ---
app.engine('handlebars', exphbs.engine({ extname: '.handlebars', defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// --- Routes ---
app.use('/', mainRoutes);

// --- Initialize Sockets ---
initializeSockets(io);

// --- Start Server ---
const PORT = process.env.CLIENT_PORT || 8090;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});