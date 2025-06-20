const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5050;

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

const corsOptions = {
    origin: ['http://localhost:3000', 'https://192.168.0.75:3000'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists.' });
        }
        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
        const newUser = new User({ username, passwordHash });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
        if (user.passwordHash !== passwordHash) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        res.json({ message: 'Login successful.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/', (req, res) => {
    res.json({ status: 'OK', message: 'Backend radi!' });
});

app.listen(PORT, () => {
    console.log(`Server radi na http://localhost:${PORT}`);
});

app.use((req, res) => {
    res.status(404).json({ message: 'Not found' });
});
