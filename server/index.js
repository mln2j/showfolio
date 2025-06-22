const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const User = require('./models/User');
const multer = require('multer');
const fs = require('fs'); // DODAJ OVAJ IMPORT
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5050;

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory');
}

// Multer konfiguracija
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// CORS konfiguracija
const corsOptions = {
    origin: [
        'http://localhost:3000',
        'https://192.168.0.75:3000',
        'https://showfolio.netlify.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// Spajanje na bazu
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Funkcija za cookie opcije
function getCookieOptions() {
    return {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: 3600000
    };
}

// ... ostatak koda (authenticate, rute, itd.) ...
