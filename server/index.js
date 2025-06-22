const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const User = require('./models/User');
const multer = require('multer');
const path = require('path');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5050;

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

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

function getCookieOptions(req) {
    const host = req.headers.origin || req.hostname || '';
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
    if (isLocalhost) {
        return {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            maxAge: 3600000
        };
    } else {
        return {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            maxAge: 3600000,
            domain: '.showfolio.netlify.app' // zamijeni s tvojom frontend domenom!
        };
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

app.use('/uploads', express.static('uploads'));

const authenticate = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

app.post('/api/profile', authenticate, upload.single('photo'), async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;

        if (req.file) {
            user.photoUrl = `/uploads/${req.file.filename}`;
        }

        await user.save();

        res.json({
            message: 'Profile updated',
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                photoUrl: user.photoUrl
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists.' });
        }
        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
        const newUser = new User({ email, passwordHash });
        await newUser.save();

        // AUTOMATSKI LOGIN: generiraj token i postavi cookie
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, getCookieOptions(req));
        res.status(201).json({ message: 'User registered and logged in successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
        if (user.passwordHash !== passwordHash) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, getCookieOptions(req));
        res.json({ message: 'Login successful.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/me', async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.json({ loggedIn: false });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.json({ loggedIn: false });
        }
        res.json({
            loggedIn: true,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            photoUrl: user.photoUrl
        });
    } catch (err) {
        res.json({ loggedIn: false });
    }
});

app.post('/api/logout', (req, res) => {
    res.clearCookie('token', getCookieOptions(req));
    res.json({ message: 'Logged out' });
});

app.get('/', (req, res) => {
    res.json({ status: 'OK', message: 'Backend radi!' });
});

app.use((req, res) => {
    res.status(404).json({ message: 'Not found' });
});

app.listen(PORT, () => {
    console.log(`Server radi na http://localhost:${PORT}`);
});
