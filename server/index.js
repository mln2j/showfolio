const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5050;

const corsOptions = {
    origin: ['http://localhost:3000', 'https://192.168.0.75:3000'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

const users = [];
const crypto = require('crypto');

app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }
    if (users.find(u => u.username === username)) {
        return res.status(409).json({ message: 'User already exists.' });
    }
    // Hashiraj lozinku (osnovno, za demo)
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    const user = { username, passwordHash };
    users.push(user);
    res.status(201).json({ message: 'User registered successfully.' });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    if (user.passwordHash !== passwordHash) {
        return res.status(401).json({ message: 'Invalid credentials.' });
    }
    // Za demo, vraćamo samo poruku (kasnije dodaj JWT/cookie)
    res.json({ message: 'Login successful.' });
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
