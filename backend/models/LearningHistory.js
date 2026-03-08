const mongoose = require('mongoose');

const learningHistorySchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Store as string for flexibility (demo mode uses strings)
    topic: { type: String, required: true },
    subject: { type: String, default: "General" },
    score: { type: Number, default: 0 },
    difficulty: { type: String, default: "Medium" },
    attempts: { type: Number, default: 1 },
    timeSpent: { type: Number, default: 0 }, // In seconds
    recommendation: { type: String, default: "Concept Mastered" },
    status: { type: String, default: "Completed" }
}, { timestamps: true });

module.exports = mongoose.model('LearningHistory', learningHistorySchema);
