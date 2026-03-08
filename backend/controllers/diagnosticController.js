const { generateDiagnosticQuestions } = require('../services/chatgptService');
const Performance = require('../models/Performance');
const User = require('../models/User');

exports.getDiagnosticQuestions = async (req, res) => {
    try {
        const { subjects, grade } = req.body;
        // Calling chatgptService to get diagnostic test questions
        const questions = await generateDiagnosticQuestions(subjects, grade);

        res.json({ questions });
    } catch (err) {
        res.status(500).json({ error: 'Error generating diagnostic questions' });
    }
};

exports.submitDiagnostic = async (req, res) => {
    try {
        const { userId, results } = req.body;
        // results: [{ subject, topic, understandingLevel, accuracy, learningSpeed }]

        // Save to Performance
        for (let resItem of results) {
            await Performance.create({
                userId,
                subject: resItem.subject,
                topic: resItem.topic,
                understandingLevel: resItem.understandingLevel,
                accuracy: resItem.accuracy,
                learningSpeed: resItem.learningSpeed
            });
        }

        // Update user diagnostic status
        await User.findByIdAndUpdate(userId, { diagnosticCompleted: true });

        res.json({ message: 'Diagnostic test evaluated and stored' });
    } catch (err) {
        res.status(500).json({ error: 'Error submitting diagnostic' });
    }
};
