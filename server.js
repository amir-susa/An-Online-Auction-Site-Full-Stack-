const Koa = require('koa');
const { koaBody } = require('koa-body');
const mongoose = require('mongoose');
const cors = require('@koa/cors');
const http = require('http');
const { Server } = require('socket.io'); // Socket.io server
const cloudinary = require('cloudinary').v2; // Cloudinary for image uploads
const userRoutes = require('./routes/userRoutes'); // User authentication routes
const itemRoutes = require('./routes/itemRoutes'); // Auction item routes

// Load environment variables from .env file (for local development)
require('dotenv').config();

// --- Define Allowed Origins ---
// This array specifies which frontend URLs are allowed to make requests to this backend.
// It's crucial for Cross-Origin Resource Sharing (CORS).
const allowedOrigins = [
    'http://localhost:5173', // Your local frontend (Vite's default dev port)
    'https://an-online-auction-site-full-stack.onrender.com' // <-- CRUCIAL: Your deployed Frontend URL on Render
];

// Models (assuming these are defined elsewhere and correctly imported)
// const User = require('./models/User'); // Uncomment if directly used in server.js
// const Item = require('./models/Item'); // Uncomment if directly used in server.js
// const Bid = require('./models/Bid');   // Uncomment if directly used in server.js

const app = new Koa();
const server = http.createServer(app.callback());

// --- Socket.io Server Configuration ---
// It needs its own CORS configuration
const io = new Server(server, {
    cors: {
        origin: allowedOrigins, // Use the same allowedOrigins for Socket.io
        methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods for Socket.io handshakes
        credentials: true, // Allow cookies/authorization headers
    },
});

app.context.io = io; // Make Socket.io instance available to Koa context

// Cloudinary Configuration (for image storage)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- Middleware ---

// CORS Middleware for Koa app (HTTP requests)
// Use a function for origin to handle multiple allowed origins
app.use(cors({
    origin: function (ctx) {
        const requestOrigin = ctx.request.header.origin;
        if (allowedOrigins.includes(requestOrigin)) {
            return requestOrigin; // Allow the specific origin if it's in our list
        }
        // If the origin is not allowed, Koa-cors will respond with a 403 Forbidden.
        // For development, you might relax this, but strict for production.
        return false;
    },
    credentials: true, // Allow cookies/authorization headers
}));

// koa-body middleware to parse request bodies (JSON, URL-encoded, multipart forms)
app.use(koaBody({
    multipart: true, // Enable multipart form data (for file uploads like images)
    urlencoded: true, // Enable URL-encoded form data
    json: true, // Enable JSON body parsing
    formidable: {
        uploadDir: require('os').tmpdir(), // Use OS's temporary directory for uploads
        keepExtensions: true, // Keep original file extensions
        maxFileSize: 50 * 1024 * 1024, // Max file size: 50MB
    },
}));

// --- Connect to MongoDB ---
// Use MONGODB_URI from environment variables (set on Render for production)
// Fallback to local MongoDB if MONGODB_URI is not set (for local dev)
mongoose
    .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/auction_db')
    .then(() => console.log('✅ MongoDB connected successfully.'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));

// --- Routes ---
// Attach your API routes to the Koa application
app.use(userRoutes.routes()).use(userRoutes.allowedMethods());
app.use(itemRoutes.routes()).use(itemRoutes.allowedMethods());

// --- Basic Root Route (for testing if backend is live) ---
app.use(async (ctx, next) => {
    if (ctx.path === '/') {
        ctx.body = 'Backend API is running!';
    }
    await next();
});


// --- Server Listener ---
// Use the PORT environment variable provided by Render, or default to 3000 for local development.
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`Allowed CORS origins: ${allowedOrigins.join(', ')}`);
});