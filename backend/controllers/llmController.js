const { askBloomAI } = require('../services/openaiService');

/**
 * POST /api/learning/assistant
 * Contextual chat assistant — knows about the current topic, grade, learning style
 */
const askAssistant = async (req, res) => {
    try {
        const { message, context } = req.body;
        const { grade = '10', learningStyle = 'Examples', topic = 'general concepts' } = context || {};

        const enrichedQuestion = `[Context: Teaching a Grade ${grade} student about "${topic}" using ${learningStyle} style]\n\nStudent asks: ${message}`;

        const reply = await askBloomAI(enrichedQuestion, grade);
        res.json({ reply });
    } catch (err) {
        console.error('Assistant error:', err.message);
        res.status(500).json({ error: 'Error consulting AI assistant. Check your OPENAI_API_KEY.' });
    }
};

module.exports = { askAssistant };
