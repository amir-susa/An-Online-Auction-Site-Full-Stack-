// server.js

const Koa = require('koa');
const { koaBody } = require('koa-body');
const mongoose = require('mongoose');
const cors = require('@koa/cors');
const http = require('http');
const { Server } = require('socket.io');
const cloudinary = require('cloudinary').v2;
const userRoutes = require('./routes/userRoutes');
const itemRoutes = require('./routes/itemRoutes');

// Load environment variables from .env file
require('dotenv').config();

// Models
const User = require('./models/User');
const Item = require('./models/Item');
const Bid = require('./models/Bid');

const app = new Koa();
const server = http.createServer(app.callback());
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    },
});

app.context.io = io;

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(koaBody({
    multipart: true,
    urlencoded: true,
    json: true,
    formidable: {
        uploadDir: require('os').tmpdir(),
        keepExtensions: true,
        maxFileSize: 50 * 1024 * 1024,
    },
}));

// Connect to MongoDB
mongoose
    .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/auction_db')
    .then(() => console.log('✅ MongoDB connected successfully.'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));

app.use(userRoutes.routes()).use(userRoutes.allowedMethods());
app.use(itemRoutes.routes()).use(itemRoutes.allowedMethods());

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});