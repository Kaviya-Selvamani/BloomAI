const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// ─── In-Memory Fallback DB (for when MongoDB connection fails) ────────────
const mockUsers = []; // [{ name, email, password, grade, learningStyle, _id }]

/**
 * Helper to check if Mongoose is actually connected
 */
const isConnected = () => mongoose.connection.readyState === 1;

exports.register = async (req, res) => {
    try {
        const { name, email, password, grade, learningStyle, subjects } = req.body;

        if (!isConnected()) {
            console.warn('[BloomAI] MongoDB not connected — Using In-Memory fallback for Signup');
            const existing = mockUsers.find(u => u.email === email);
            if (existing) return res.status(400).json({ error: 'Email already exists' });

            const newUser = { name, email, password, grade, learningStyle: learningStyle || "Visual", subjects: subjects || [], _id: Date.now().toString(), diagnosticCompleted: false };
            mockUsers.push(newUser);
            const token = 'demo_token_' + newUser._id;
            return res.status(201).json({
                message: 'User registered in (Demo Mode)',
                token,
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    grade: newUser.grade,
                    learningStyle: newUser.learningStyle,
                    subjects: newUser.subjects,
                    diagnosticCompleted: false
                }
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            grade,
            learningStyle: learningStyle || "Visual",
            subjects: subjects || []
        });

        await newUser.save();

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '1d' });

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                grade: newUser.grade,
                learningStyle: newUser.learningStyle,
                subjects: newUser.subjects,
                diagnosticCompleted: false
            }
        });
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ error: 'This email is already registered. Please Login instead.' });
        res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!isConnected()) {
            console.warn('[BloomAI] MongoDB not connected — Using In-Memory fallback for Login');
            const user = mockUsers.find(u => u.email === email && u.password === password);
            if (!user) return res.status(400).json({ error: 'Invalid credentials (Demo Mode)' });

            const token = 'demo_token_' + user._id;
            return res.json({ token, user: { id: user._id, name: user.name, grade: user.grade, learningStyle: user.learningStyle, subjects: user.subjects || [], diagnosticCompleted: user.diagnosticCompleted } });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '1d' });

        res.json({ token, user: { id: user._id, name: user.name, grade: user.grade, learningStyle: user.learningStyle, subjects: user.subjects, diagnosticCompleted: user.diagnosticCompleted } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        if (!isConnected()) {
            const user = mockUsers.find(u => u._id === req.user.id);
            if (!user) return res.status(404).json({ error: 'User not found in demo storage' });
            return res.json({ id: user._id, name: user.name, email: user.email, grade: user.grade, learningStyle: user.learningStyle, subjects: user.subjects || [] });
        }

        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        console.log('updateProfile called for user:', req.user && req.user.id, 'body:', req.body);
        const { grade, subjects } = req.body;

        if (!isConnected()) {
            // Update or create in-memory mock user
            let user = mockUsers.find(u => u._id === req.user.id);
            if (!user) {
                user = { _id: req.user.id, name: 'Demo User', email: 'demo@local', password: 'demo', grade: grade || '10', learningStyle: 'Visual', subjects: subjects || [] };
                mockUsers.push(user);
                return res.json({ message: 'Profile created (demo mode)', user: { id: user._id, name: user.name, grade: user.grade, subjects: user.subjects } });
            }
            if (grade) user.grade = grade;
            if (subjects) user.subjects = subjects;
            return res.json({ message: 'Profile updated (demo mode)', user: { id: user._id, name: user.name, grade: user.grade, subjects: user.subjects } });
        }

        // If the req.user.id is not a valid Mongo ObjectId, treat as demo token and update/create mock user
        const isLikelyObjectId = typeof req.user.id === 'string' && req.user.id.match(/^[0-9a-fA-F]{24}$/);
        if (!isLikelyObjectId) {
            let user = mockUsers.find(u => u._id === req.user.id);
            if (!user) {
                user = { _id: req.user.id, name: 'Demo User', email: 'demo@local', password: 'demo', grade: grade || '10', learningStyle: 'Visual', subjects: subjects || [] };
                mockUsers.push(user);
                return res.json({ message: 'Profile created (demo mode)', user: { id: user._id, name: user.name, grade: user.grade, subjects: user.subjects } });
            }
            if (grade) user.grade = grade;
            if (subjects) user.subjects = subjects;
            return res.json({ message: 'Profile updated (demo mode)', user: { id: user._id, name: user.name, grade: user.grade, subjects: user.subjects } });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (grade) user.grade = grade;
        if (subjects) user.subjects = subjects;
        await user.save();
        res.json({ message: 'Profile updated', user: { id: user._id, name: user.name, grade: user.grade, subjects: user.subjects } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
