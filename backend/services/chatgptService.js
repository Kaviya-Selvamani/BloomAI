// chatgptService.js — re-exports from the centralised openaiService
// Kept for backward compatibility with diagnosticController.js
const { askBloomAI, generateLearningRoadmap, explainTopic } = require('./openaiService');

const generateDiagnosticQuestions = async (subjects, grade) => {
    const question = `Generate diagnostic quiz questions for a Grade ${grade} student for subjects: ${subjects.join(', ')}.
  Provide Easy, Medium, and Hard questions for each main topic.
  Return ONLY valid JSON: { "[Subject]": { "[Topic]": { "Easy": ["Q1"], "Medium": ["Q2"], "Hard": ["Q3"] } } }`;
    const result = await askBloomAI(question, grade);
    try {
        // Extract JSON from the response
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch {
        return {};
    }
};

module.exports = {
    generateDiagnosticQuestions,
    generateLearningRoadmap,
    explainTopic,
    askBloomAI,
};
