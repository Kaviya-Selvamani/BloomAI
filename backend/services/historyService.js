const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const LearningHistory = require('../models/LearningHistory');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'local_history.json');

function ensureDataFile() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify([]), 'utf8');
}

async function saveHistory(entry) {
    // If MongoDB is connected, save using Mongoose
    if (mongoose.connection && mongoose.connection.readyState === 1) {
        return await LearningHistory.create(entry);
    }

    // Fallback: write to local JSON file
    ensureDataFile();
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    let arr = [];
    try { arr = JSON.parse(raw || '[]'); } catch (e) { arr = []; }

    const record = Object.assign({}, entry, { _id: (new Date()).getTime().toString(), createdAt: new Date() });
    arr.unshift(record);
    fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2), 'utf8');
    return record;
}

async function getHistory(userId) {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
        return await LearningHistory.find({ userId }).sort({ createdAt: -1 });
    }

    ensureDataFile();
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    let arr = [];
    try { arr = JSON.parse(raw || '[]'); } catch (e) { arr = []; }
    return arr.filter(r => r.userId === userId);
}

module.exports = { saveHistory, getHistory };
