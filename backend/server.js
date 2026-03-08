require("dotenv").config({ path: "./.env" });
console.log("OpenAI key loaded:", process.env.OPENAI_API_KEY ? "YES" : "NO");

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// ─── Route imports ─────────────────────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const learningRoutes = require('./routes/learningRoutes');
const quizRoutes = require('./routes/quizRoutes');
const askRoutes = require('./routes/askRoutes');

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cors());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/ask', askRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'BloomAI backend running' });
});

// ─── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bloomai';

app.listen(PORT, () => {
    console.log(`✅ BloomAI backend running on http://localhost:${PORT}`);
    console.log(`   POST http://localhost:${PORT}/api/ask  →  AI explanation`);
    console.log(`   POST http://localhost:${PORT}/api/ask/roadmap  →  Learning roadmap`);
    console.log(`   POST http://localhost:${PORT}/api/ask/explain  →  Topic explanation`);
});

// MongoDB connection
mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => {
        console.warn('⚠️  MongoDB not connected:', err.message);
    });
