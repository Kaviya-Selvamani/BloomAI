import { useState, useEffect, useContext, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy,
    Star,
    ArrowLeft,
    RefreshCcw,
    LayoutDashboard,
    Share2,
    Sparkles,
    Loader2,
    CheckCircle2,
    XCircle,
    ChevronRight,
    Award
} from 'lucide-react';
import { UserContext } from '../context/UserContext';

const BASE_URL = "http://localhost:5001";

const FinalQuiz = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const { originalQuestion, topic, roadmap = [] } = location.state || {};

    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [quizComplete, setQuizComplete] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [evaluation, setEvaluation] = useState(null);
    const startTime = useRef(Date.now());

    useEffect(() => {
        if (!originalQuestion && !topic) {
            navigate('/dashboard');
            return;
        }
        fetchQuiz();
    }, [originalQuestion, topic]);

    const fetchQuiz = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/api/ask/quiz/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ topic: originalQuestion || topic, grade: user?.grade })
            });
            const data = await res.json();
            setQuestions(data.questions || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSelect = (option) => {
        setAnswers({ ...answers, [currentStep]: option });
    };

    const nextStep = () => {
        if (currentStep < questions.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            finishQuiz();
        }
    };

    const finishQuiz = async () => {
        setSubmitting(true);
        const correctCount = questions.filter((q, i) => answers[i] === q.correct || answers[i] === q.answer).length;
        const accuracy = Math.round((correctCount / questions.length) * 100);
        const timeTaken = Math.floor((Date.now() - startTime.current) / 1000);

        // Evaluation Logic
        let recommendation = "Concept Mastered";
        if (accuracy < 50) recommendation = "Relearn Concept";
        else if (accuracy < 75) recommendation = "Revise Key Ideas";

        const evaluationObj = { accuracy, correctCount, recommendation, timeTaken };
        setEvaluation(evaluationObj);

        // Build topic-level performance (single-topic summary for now)
        const topicPerformance = [
            { topic: originalQuestion || topic, score: accuracy, status: recommendation === 'Concept Mastered' ? 'Good Understanding' : (recommendation === 'Revise Key Ideas' ? 'Revision Recommended' : 'Needs Improvement') }
        ];

        // Build learning profile
        const learningStyle = accuracy < 50 ? 'slow' : (accuracy <= 75 ? 'medium' : 'fast');
        const learningProfile = {
            learningStyle,
            averageScore: accuracy,
            topicsLearned: 1,
            averageTimePerTopic: Math.max(1, Math.round(timeTaken / 1))
        };

        // Save session to localStorage (persist locally as requested)
        try {
            const entry = {
                topic: originalQuestion || topic,
                quizScore: accuracy,
                attempts: 1,
                timeSpent: timeTaken,
                recommendation,
                date: new Date().toISOString()
            };
            const key = 'bloom_history';
            const raw = localStorage.getItem(key);
            let arr = [];
            try { arr = raw ? JSON.parse(raw) : []; } catch (e) { arr = []; }
            arr.unshift(entry);
            localStorage.setItem(key, JSON.stringify(arr));
            localStorage.setItem('bloom_profile', JSON.stringify(learningProfile));
        } catch (e) {
            console.warn('Could not save local history', e.message);
        }

        try {
            await fetch(`${BASE_URL}/api/learning/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    userId: user?._id || user?.id,
                    topic: originalQuestion || topic,
                    score: accuracy,
                    difficulty: "Adaptive",
                    attempts: 1,
                    timeSpent: timeTaken,
                    recommendation,
                    status: accuracy >= 75 ? "Mastered" : "Needs Revision"
                })
            });
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
            // Navigate to Learning Statistics page with computed data
            navigate('/statistics', { state: { evaluation: evaluationObj, topicPerformance, learningProfile, roadmap } });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-8 text-center px-6">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                    <Loader2 size={80} className="text-amber-500" />
                </motion.div>
                <div className="space-y-4">
                    <h2 className="text-4xl font-black text-white italic">Preparing Adaptive Quiz...</h2>
                    <p className="text-neutral-500 font-bold text-xl">Calibrating levels: 2 Easy, 2 Medium, 1 Hard, 1 Advanced</p>
                </div>
            </div>
        );
    }

    if (quizComplete && evaluation) {
        const { accuracy, correctCount, recommendation } = evaluation;

        let resultLabel = "Excellent Mastery!";
        let resultSub = "You've fully grasped the core and advanced concepts.";
        let resultColor = "text-amber-400";
        let icon = <Trophy size={80} />;

        if (recommendation === "Relearn Concept") {
            resultLabel = "Needs Revision";
            resultSub = "Don't worry! BloomAI will teach you in a simpler way.";
            resultColor = "text-red-400";
            icon = <Star size={80} />;
        } else if (recommendation === "Revise Key Ideas") {
            resultLabel = "Good Understanding";
            resultSub = "You've got the basics down, just a bit more practice needed.";
            resultColor = "text-indigo-400";
            icon = <Award size={80} />;
        }

        return (
            <div className="max-w-4xl mx-auto py-20 px-6 text-center">
                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`mb-12 inline-flex ${resultColor.replace('text', 'bg')}/20 p-10 rounded-[3rem] shadow-2xl relative`}>
                    <div className="relative z-10">{icon}</div>
                </motion.div>

                <motion.h1 initial={{ y: 20 }} animate={{ y: 0 }} className="text-7xl font-black text-white mb-6 italic">
                    {resultLabel}
                </motion.h1>
                <p className="text-neutral-400 text-2xl font-medium max-w-2xl mx-auto mb-16 italic">{resultSub}</p>

                <div className="grid grid-cols-3 gap-6 mb-20 max-w-3xl mx-auto">
                    <div className="bg-neutral-800 p-8 rounded-[2rem] border-2 border-neutral-700">
                        <h4 className="text-neutral-500 font-bold uppercase text-xs mb-2">Score</h4>
                        <p className="text-white text-4xl font-black italic">{accuracy}%</p>
                    </div>
                    <div className="bg-neutral-800 p-8 rounded-[2rem] border-2 border-neutral-700">
                        <h4 className="text-neutral-500 font-bold uppercase text-xs mb-2">Verdict</h4>
                        <p className={`text-xl font-black italic ${resultColor} leading-tight`}>{recommendation}</p>
                    </div>
                    <div className="bg-neutral-800 p-8 rounded-[2rem] border-2 border-neutral-700">
                        <h4 className="text-neutral-500 font-bold uppercase text-xs mb-2">Result</h4>
                        <p className={`text-4xl font-black italic ${resultColor}`}>{correctCount}/{questions.length}</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
                    {recommendation === "Relearn Concept" ? (
                        <button onClick={() => navigate('/learn', { state: { topic: topic || originalQuestion, mode: 'relearn', roadmap } })} className="px-12 py-6 bg-red-600 hover:bg-red-700 text-white font-black text-xl rounded-2xl shadow-2xl transition-all">
                            Relearn Concept
                        </button>
                    ) : (
                        <button onClick={() => navigate('/dashboard')} className="px-12 py-6 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xl rounded-2xl shadow-2xl transition-all">
                            Finish Subject
                        </button>
                    )}
                    <button onClick={() => navigate('/history')} className="px-12 py-6 bg-neutral-800 hover:bg-neutral-700 text-white font-black text-xl rounded-2xl transition-all border-2 border-neutral-700">
                        View History
                    </button>
                </div>
            </div>
        );
    }

    const q = questions[currentStep];

    return (
        <div className="max-w-3xl mx-auto py-12 px-6">
            <header className="mb-14 flex items-center justify-between">
                <div>
                    <span className="bg-amber-600/20 text-amber-500 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-amber-500/20 mb-4 inline-block italic">
                        Mastery Quiz
                    </span>
                    <h1 className="text-4xl font-black text-white italic">Mastering {originalQuestion || topic}</h1>
                </div>
                <div className="text-right">
                    <p className="text-neutral-500 font-black text-xs uppercase mb-1">Question</p>
                    <p className="text-white text-3xl font-black italic">{currentStep + 1} / {questions.length}</p>
                </div>
            </header>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="bg-neutral-800 border-4 border-neutral-700/50 p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-6">
                        <span className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border border-opacity-30 ${q?.level === 'Easy' ? 'bg-green-600/20 text-green-400 border-green-500' :
                            q?.level === 'Medium' ? 'bg-blue-600/20 text-blue-400 border-blue-500' :
                                q?.level === 'Hard' ? 'bg-orange-600/20 text-orange-400 border-orange-500' :
                                    'bg-red-600/20 text-red-400 border-red-500'
                            }`}>
                            {q?.level}
                        </span>
                    </div>

                    <h2 className="text-3xl font-black text-white mb-12 leading-tight italic pr-20">{q?.question}</h2>

                    <div className="grid gap-4">
                        {q?.options?.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleAnswerSelect(option)}
                                className={`w-full text-left p-6 rounded-[2rem] border-4 transition-all font-black text-xl flex items-center gap-5 ${answers[currentStep] === option
                                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-2xl shadow-indigo-600/40 translate-x-3'
                                    : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:bg-neutral-800'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${answers[currentStep] === option ? 'border-white bg-white' : 'border-neutral-700'}`}>
                                    {answers[currentStep] === option && <div className="w-4 h-4 bg-indigo-600 rounded-full" />}
                                </div>
                                {option}
                            </button>
                        ))}
                    </div>

                    <div className="mt-14 pt-10 border-t border-neutral-700/50 flex justify-end">
                        <button
                            disabled={!answers[currentStep] || submitting}
                            onClick={nextStep}
                            className="p-1 px-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2.5rem] flex items-center gap-8 shadow-2xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 group disabled:opacity-50 disabled:scale-100"
                        >
                            <span className="pl-14 text-2xl font-black italic">
                                {submitting ? 'Analyzing...' : currentStep === questions.length - 1 ? 'Finish Challenge' : 'Next Question'}
                            </span>
                            <div className="w-18 h-18 bg-white rounded-full flex items-center justify-center text-indigo-600 group-hover:rotate-12 transition-transform shadow-xl p-4">
                                {submitting ? <Loader2 className="animate-spin" size={32} /> : <ChevronRight size={32} strokeWidth={4} />}
                            </div>
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default FinalQuiz;
