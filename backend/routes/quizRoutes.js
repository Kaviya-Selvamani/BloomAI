const express = require('express');
const { generateDiagnosticQuestions } = require('../services/chatgptService');
const historyService = require('../services/historyService');
const router = express.Router();

router.post('/final-quiz', async (req, res) => {
    try {
        const { topic, grade } = req.body;
        // For simplicity using diagnostic generator, but theoretically could prompt specifically for "final quiz"
        const questions = await generateDiagnosticQuestions([topic], grade);
        res.json({ questions });
    } catch (err) {
        res.status(500).json({ error: 'Error generating final quiz' });
    }
});

router.post('/final-quiz/submit', async (req, res) => {
    try {
        const { userId, topic, subject, score, total, weakAreas } = req.body;

        const accuracy = (score / total) * 100;
        let learningPace = 'average';
        if (accuracy >= 80) learningPace = 'fast';
        if (accuracy < 50) learningPace = 'needs-revision';

        // Save a normalized history entry compatible with LearningHistory schema
        const recommendation = accuracy > 75 ? 'Mastered' : (accuracy >= 50 ? 'Revise' : 'Relearn');

        const record = {
            userId: userId || 'unknown',
            topic: topic || 'Unknown Topic',
            subject: subject || 'General',
            score: Math.round(accuracy),
            difficulty: 'Mixed',
            attempts: 1,
            timeSpent: 0,
            recommendation,
            status: recommendation === 'Mastered' ? 'Completed' : 'Needs Attention',
        };

        let saved;
        try {
            saved = await historyService.saveHistory(record);
        } catch (saveErr) {
            console.error('Error saving historyEntry:', saveErr);
            return res.status(500).json({ error: 'Error saving quiz results', details: saveErr.message });
        }

        res.json({ message: 'Quiz submitted', historyEntry: saved, learningPace, weakAreas });
    } catch (err) {
        console.error('final-quiz/submit error:', err);
        res.status(500).json({ error: 'Error submitting final quiz', details: err.message });
    }
});

module.exports = router;
