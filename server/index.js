const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const User = require('./models/User');
const Showfolio = require('./models/Showfolio');
const multer = require('multer');
const fs = require('fs');
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
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
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

function getCookieOptions() {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'lax',
        secure: isProduction,
        maxAge: 3600000
    };
}


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

// Debug endpoint za provjeru cookieja
app.get('/api/debug-cookies', (req, res) => {
    console.log('Request cookies:', req.cookies);
    res.json({
        cookies: req.cookies,
        headers: req.headers
    });
});

// PROFILE
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

// PATCH /api/settings - Ažuriraj profil (ime, prezime, slika)
app.patch('/api/settings', authenticate, upload.single('photo'), async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Ažuriraj ime i prezime
        if (req.body.firstName) user.firstName = req.body.firstName;
        if (req.body.lastName) user.lastName = req.body.lastName;

        // Ažuriraj sliku ako je uploadana
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

// PATCH /api/settings/password
app.patch('/api/settings/password', authenticate, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Both passwords required' });
    }
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const oldHash = crypto.createHash('sha256').update(oldPassword).digest('hex');
        if (user.passwordHash !== oldHash) {
            return res.status(401).json({ message: 'Old password incorrect' });
        }
        user.passwordHash = crypto.createHash('sha256').update(newPassword).digest('hex');
        await user.save();
        res.json({ message: 'Password changed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/showfolio - Dohvati svoj showfolio
app.get('/api/showfolio', authenticate, async (req, res) => {
    try {
        let showfolio = await Showfolio.findOne({ user: req.userId });
        if (!showfolio) {
            // Ako ne postoji, kreiraj defaultni showfolio
            showfolio = await Showfolio.create({
                user: req.userId,
                isPublic: true,
                isUnlisted: false,
                primaryColor: "#6366f1",
                sections: [],
                links: []
            });
        }
        res.json(showfolio);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// PATCH /api/showfolio - Uredi svoj showfolio
app.patch('/api/showfolio', authenticate, async (req, res) => {
    try {
        let showfolio = await Showfolio.findOne({ user: req.userId });
        if (!showfolio) {
            return res.status(404).json({ message: "Showfolio not found" });
        }
        // Dozvoli update samo ovih polja:
        const { isPublic, isUnlisted, primaryColor, sections, links } = req.body;
        if (typeof isPublic === "boolean") showfolio.isPublic = isPublic;
        if (typeof isUnlisted === "boolean") showfolio.isUnlisted = isUnlisted;
        if (primaryColor) showfolio.primaryColor = primaryColor;
        if (sections) showfolio.sections = sections;
        if (links) showfolio.links = links;
        await showfolio.save();
        res.json(showfolio);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/showfolio/:username - Javni prikaz showfolija
app.get('/api/showfolio/:username', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.username }) // ili koristi username polje
        if (!user) return res.status(404).json({ message: "User not found" });
        const showfolio = await Showfolio.findOne({ user: user._id });
        if (!showfolio) return res.status(404).json({ message: "Showfolio not found" });

        // Privatnost
        if (!showfolio.isPublic && !showfolio.isUnlisted) {
            return res.status(403).json({ message: "Showfolio is private" });
        }
        res.json(showfolio);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});


// REGISTER
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

        // AUTOMATSKI LOGIN
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, getCookieOptions());
        res.status(201).json({ message: 'User registered and logged in successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// LOGIN
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

        res.cookie('token', token, getCookieOptions());
        res.json({ message: 'Login successful.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ME
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
        console.error('JWT verify error:', err);
        res.json({ loggedIn: false });
    }
});

// LOGOUT
app.post('/api/logout', (req, res) => {
    res.clearCookie('token', getCookieOptions());
    res.json({ message: 'Logged out' });
});

// ROOT
app.get('/', (req, res) => {
    res.json({ status: 'OK', message: 'Backend radi!' });
});

// 404
app.use((req, res) => {
    res.status(404).json({ message: 'Not found' });
});

app.listen(PORT, () => {
    console.log(`Server radi na http://localhost:${PORT}`);
    console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
});

