const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    topic: { type: String, required: true },
    understandingLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    accuracy: { type: Number, default: 0 },
    learningSpeed: { type: String, default: 'medium' }
}, { timestamps: true });

module.exports = mongoose.model('Performance', performanceSchema);
