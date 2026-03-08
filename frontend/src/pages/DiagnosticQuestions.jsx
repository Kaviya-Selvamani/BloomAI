import { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Brain, CheckCircle, ArrowRight, HelpCircle } from 'lucide-react';
import { UserContext } from '../context/UserContext';

const BASE_URL = "http://localhost:5001";

const normalizeRoadmapItem = (item, index) => {
    if (typeof item === 'string') return item.trim() || `Step ${index + 1}`;
    if (item && typeof item === 'object') {
        const candidate = item.title || item.step || item.topic || item.name || item.description;
        if (candidate && typeof candidate === 'string') return candidate.trim();
    }
    return `Step ${index + 1}`;
};

const normalizeRoadmap = (roadmap = []) => (
    Array.isArray(roadmap) ? roadmap.map((item, index) => normalizeRoadmapItem(item, index)) : []
);

const DiagnosticQuestions = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useContext(UserContext);

    // Safety check for location state
    const state = location.state || {};
    const { question, subject: navSubject, grade: navGrade } = state;

    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!question) {
            navigate('/dashboard');
            return;
        }
        fetchQuestions();
    }, [question]);

    const fetchQuestions = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${BASE_URL}/api/ask/diagnostic`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    question,
                    subject: navSubject || 'General',
                    grade: navGrade || user?.grade || '10'
                })
            });

            if (!res.ok) throw new Error("Failed to fetch diagnostic questions");

            const data = await res.json();
            const fetchedQuestions = data.questions || [];

            let finalQuestions = fetchedQuestions;
            if (fetchedQuestions.length === 0) {
                // Fallback MCQ questions
                finalQuestions = [
                    {
                        question: "What is your current understanding of " + question + "?",
                        options: ["Beginner", "Intermediate", "Advanced", "Expert"],
                        correct: "Beginner"
                    }
                ];
            }
            setQuestions(finalQuestions);

            // Initialize answers for the final questions
            const initialAnswers = {};
            finalQuestions.forEach((_, i) => initialAnswers[i] = "");
            setAnswers(initialAnswers);

        } catch (err) {
            console.error("Diagnostic Fetch Error:", err);
            setError("Could not load MCQ questions. Let's try to proceed.");
            setQuestions([{
                question: "How ready do you feel for this lesson?",
                options: ["Not at all", "Somewhat", "Very ready", "I'm already proportional!"],
                correct: "Very ready"
            }]);
            setAnswers({ 0: "" });
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (qIndex, option) => {
        setAnswers(prev => ({ ...prev, [qIndex]: option }));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        // Ensure all questions are answered
        const allAnswered = questions.every((_, i) => answers[i]);
        if (!allAnswered) {
            alert("Please answer all questions before proceeding!");
            return;
        }

        setSubmitting(true);
        try {
            // Compute diagnostic score locally when possible
            const total = questions.length || 1;
            let correctCount = 0;
            questions.forEach((q, i) => {
                if (q.correct && answers[i] && answers[i] === q.correct) correctCount += 1;
            });
            const diagnosticScore = Math.round((correctCount / total) * 100);
            let learnerLevel = 'medium';
            if (diagnosticScore < 50) learnerLevel = 'slow';
            else if (diagnosticScore > 75) learnerLevel = 'fast';

            const res = await fetch(`${BASE_URL}/api/ask/roadmap`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ question, answers, diagnosticScore, learningStyle: learnerLevel, grade: navGrade || user?.grade || '10', subject: navSubject || 'General' })
            });

            if (!res.ok) throw new Error("Roadmap generation failed");

            const data = await res.json();
            const normalized = normalizeRoadmap(data.roadmap || []);
            navigate('/roadmap', { state: { question, roadmap: normalized, diagnosticScore, learningStyle: learnerLevel } });
        } catch (err) {
            console.error("Roadmap Submission Error:", err);
            navigate('/roadmap', { state: { question, roadmap: ["Fundamentals", "Concepts", question], diagnosticScore: 50, learningStyle: 'medium' } });
        } finally {
            setSubmitting(false);
        }
    };

    if (!question) return null;

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 p-4">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="w-20 h-20 bg-indigo-600/20 rounded-3xl flex items-center justify-center border-2 border-indigo-500/50"
                >
                    <Brain size={40} className="text-indigo-400" />
                </motion.div>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">Generating MCQs...</h2>
                    <p className="text-neutral-500 font-medium italic">BloomAI is preparing a quick check for "{question}"</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-12 px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
                <span className="bg-indigo-600/20 text-indigo-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-500/20 mb-4 inline-block">
                    Diagnostic Quiz
                </span>
                <h1 className="text-4xl font-black text-white mb-4 italic">Quick Knowledge Check!</h1>
                <p className="text-neutral-400 text-lg">Pick the correct options to help me tailor your path for <b>{question}</b>.</p>
            </motion.div>

            {error && (
                <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-300 text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-12">
                {questions.map((q, qIndex) => (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: qIndex * 0.1 }}
                        key={qIndex}
                        className="bg-neutral-800 border-2 border-neutral-700/50 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black shadow-lg">
                                {qIndex + 1}
                            </div>
                            <h3 className="text-2xl font-black text-white leading-tight italic">{q.question}</h3>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {q.options?.map((option, oIndex) => (
                                <button
                                    key={oIndex}
                                    onClick={() => handleOptionSelect(qIndex, option)}
                                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all font-bold text-lg flex items-center gap-4 ${answers[qIndex] === option
                                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/20'
                                        : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:bg-neutral-800'
                                        }`}
                                >
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${answers[qIndex] === option ? 'border-white bg-white' : 'border-neutral-700'}`}>
                                        {answers[qIndex] === option && <div className="w-3 h-3 bg-indigo-600 rounded-full" />}
                                    </div>
                                    {option}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                ))}

                <motion.button
                    onClick={handleSubmit}
                    disabled={submitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-2xl rounded-3xl transition-all shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-4 disabled:opacity-50"
                >
                    {submitting ? (
                        <>
                            <Loader2 size={24} className="animate-spin" />
                            Analyzing Results...
                        </>
                    ) : (
                        <>
                            <CheckCircle size={24} />
                            Finish & Show Roadmap
                            <ArrowRight size={20} />
                        </>
                    )}
                </motion.button>
            </div>
        </div>
    );
};

export default DiagnosticQuestions;
