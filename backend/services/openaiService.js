const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || "missing",
});

// ─── Demo Data ───────────────────────────────────────────────────────────────
const DEMO_DIAGNOSTIC = {
    "Mathematics": {
        "Fractions": { "Easy": ["What is 1/2 of 10?"], "Medium": ["Simplify 4/8"], "Hard": ["Calculate 3/4 + 1/2"] },
        "Algebra": { "Easy": ["Solve x + 2 = 5"], "Medium": ["Expand 2(x + 3)"], "Hard": ["Factorise x^2 - 4"] }
    }
};

/**
 * General AI assistant — explains a concept for a specific grade
 */
const askBloomAI = async (question, grade) => {
    if (!process.env.GROQ_API_KEY) {
        if (question.toLowerCase().includes("diagnostic")) return JSON.stringify(DEMO_DIAGNOSTIC);
        return "## BloomAI Demo Mode\n\nGroq key is missing, so I'm using a pre-set response. Please add a GROQ_API_KEY to the \`.env\` file.";
    }

    try {
        const completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: 'system',
                    content: `You are BloomAI, an AI tutor explaining concepts to a Grade ${grade || "10"} student using simple examples.`
                },
                { role: 'user', content: question }
            ],
        });
        return completion.choices[0].message.content;
    } catch (e) {
        return `## Error\n\nGroq service unavailable: ${e.message}`;
    }
};

/**
 * Generates a prerequisite learning roadmap for a given question/topic
 */
const generateLearningRoadmap = async (question) => {
    if (!process.env.GROQ_API_KEY) {
        return { roadmap: ["Basic Math", "Numbers", "Operations", question] };
    }

    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [{
                role: 'user',
                content: `Identify prerequisites for "${question}". Return JSON: { "roadmap": ["Step1", "Step2"] }`
            }],
            response_format: { type: 'json_object' },
        });
        return JSON.parse(response.choices[0].message.content);
    } catch {
        return { roadmap: ["Topic Basics", question] };
    }
};

/**
 * Explains a single topic for a specific grade
 */
const explainTopic = async (topic, grade) => {
    if (!process.env.GROQ_API_KEY) {
        return "## Demo Explanation\n\n(Groq key missing) This topic is fundamental to understanding " + topic + ".";
    }

    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [{
                role: 'user',
                content: `Explain "${topic}" to Grade ${grade || "10"}.`
            }],
        });
        return response.choices[0].message.content;
    } catch (e) {
        return `## Error\n\nExplanation unavailable: ${e.message}`;
    }
};

module.exports = { askBloomAI, generateLearningRoadmap, explainTopic };
