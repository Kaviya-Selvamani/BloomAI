import { useState, useContext, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserContext } from "../context/UserContext";
import {
    BookOpen,
    ChevronRight,
    Loader2,
    Lightbulb,
    Map,
    Send,
    Star,
    Zap,
    Brain,
    Layers,
    Image as ImageIcon,
    Target,
    CheckCircle2
} from "lucide-react";

const BASE_URL = "http://localhost:5001";

// ─── Concept Icons Helper ───────────────────────────────────────────────────
const getConceptIcon = (topic = "") => {
    const t = topic.toLowerCase();
    if (t.includes("math") || t.includes("algebra") || t.includes("geometry") || t.includes("fraction")) return "📐";
    if (t.includes("bio") || t.includes("cell") || t.includes("photosynthesis") || t.includes("plant") || t.includes("human")) return "🧬";
    if (t.includes("physic") || t.includes("force") || t.includes("energy") || t.includes("electricity") || t.includes("atom")) return "⚡";
    if (t.includes("chem") || t.includes("reaction") || t.includes("molecule") || t.includes("acid")) return "🧪";
    return "💡";
};

const normalizeRoadmapItem = (item, index) => {
    if (typeof item === 'string') return item.trim() || `Step ${index + 1}`;
    if (item && typeof item === 'object') {
        const candidate = item.title || item.step || item.topic || item.name || item.description;
        if (candidate && typeof candidate === 'string') return candidate.trim();
    }
    return `Step ${index + 1}`;
};

const inferSubjectFromText = (text = "") => {
    const t = (text || '').toLowerCase();
    if (/math|algebra|geometry|fraction|equation|pythagoras|calculus/.test(t)) return 'Math';
    if (/physic|force|energy|velocity|acceleration|gravity|circuit/.test(t)) return 'Physics';
    if (/chem|molecule|reaction|acid|base|periodic/.test(t)) return 'Chemistry';
    if (/bio|cell|photosynth|organism|dna|biology|anatomy/.test(t)) return 'Biology';
    if (/grammar|essay|poem|reading|vocabulary|literature/.test(t)) return 'English';
    if (/science/.test(t)) return 'Science';
    return 'General';
};

// ─── Renders AI markdown-like text ──────────────────────────────────────────
const renderText = (text) => {
    if (!text) return null;
    return text.split("\n").map((line, i) => {
        if (line.startsWith("## ")) {
            return <h3 key={i} className="text-lg font-bold mt-5 mb-2 text-indigo-400">{line.slice(3)}</h3>;
        }
        if (line.startsWith("# ")) {
            return <h2 key={i} className="text-xl font-bold mt-5 mb-2 text-white">{line.slice(2)}</h2>;
        }
        if (line.trim() === "") return <br key={i} />;
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
            <p key={i} className="mb-1.5 text-neutral-300 leading-relaxed text-base">
                {parts.map((part, j) =>
                    part.startsWith("**") && part.endsWith("**")
                        ? <strong key={j} className="text-white font-semibold">{part.slice(2, -2)}</strong>
                        : part
                )}
            </p>
        );
    });
};

// ─── Infographic Mode Helper ────────────────────────────────────────────────
const RenderInfographic = ({ text, topic }) => {
    const lines = text.split("\n").filter(l => l.trim() !== "");
    return (
        <div className="space-y-6 mt-4">
            {lines.slice(0, 4).map((line, i) => (
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i}
                    className="flex items-start gap-4 p-4 bg-neutral-900/50 rounded-xl border border-neutral-700/50"
                >
                    <div className="w-10 h-10 bg-indigo-600/20 text-indigo-400 rounded-lg flex items-center justify-center shrink-0 border border-indigo-500/20">
                        {i === 0 ? <Brain size={20} /> : i === 1 ? <Target size={20} /> : <Zap size={20} />}
                    </div>
                    <div>
                        <p className="text-neutral-200 text-sm leading-relaxed">{line.replace(/#+\s*/, "").replace(/\*\*/g, "")}</p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

// ─── Flashcard Component ──────────────────────────────────────────────────
const Flashcard = ({ question, answer }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    return (
        <div
            className="w-full h-64 perspective-1000 cursor-pointer group"
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <motion.div
                className="relative w-full h-full duration-500 preserve-3d"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                {/* Front */}
                <div className="absolute inset-0 backface-hidden bg-neutral-800 border-2 border-indigo-500/30 rounded-2xl flex flex-col items-center justify-center p-8 text-center shadow-xl">
                    <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">Front (Question)</span>
                    <h3 className="text-xl font-bold text-white">{question}?</h3>
                    <p className="text-neutral-500 text-xs mt-6">Click to reveal answer</p>
                </div>
                {/* Back */}
                <div className="absolute inset-0 backface-hidden bg-indigo-950 border-2 border-indigo-400/50 rounded-2xl flex flex-col items-center justify-center p-8 text-center shadow-xl rotate-y-180">
                    <span className="text-indigo-300 text-xs font-bold uppercase tracking-widest mb-4">Back (Explanation)</span>
                    <div className="text-indigo-50 text-sm overflow-y-auto max-h-full scrollbar-hide">
                        {answer.length > 200 ? answer.slice(0, 200) + "..." : answer}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const AskDoubt = () => {
    const { user } = useContext(UserContext);
    const grade = user?.grade || "10";

    const [question, setQuestion] = useState("");
    const [explanation, setExplanation] = useState("");
    const [loadingAnswer, setLoadingAnswer] = useState(false);

    const [roadmap, setRoadmap] = useState([]);
    const [loadingRoadmap, setLoadingRoadmap] = useState(false);

    const [selectedTopic, setSelectedTopic] = useState(null);
    const [topicExplanation, setTopicExplanation] = useState("");
    const [loadingTopic, setLoadingTopic] = useState(false);

    const [learningMode, setLearningMode] = useState("explain"); // explain, infographic, story, flashcard
    const [error, setError] = useState("");

    const [completedTopics, setCompletedTopics] = useState([]);

    const askAI = async () => {
        if (!question.trim()) return;
        setLoadingAnswer(true);
        setExplanation("");
        setRoadmap([]);
        setError("");
        setSelectedTopic(null);
        setTopicExplanation("");
        setLearningMode("explain");

        try {
            const subject = inferSubjectFromText(selectedTopic || question || '');
            const res = await fetch(`${BASE_URL}/api/ask`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question, grade, subject }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setExplanation(data.answer);
            if (!completedTopics.includes(question)) {
                setCompletedTopics([...completedTopics, question]);
            }
        } catch (err) {
            setError("⚠️ Could not reach BloomAI. Check backend connection.");
        } finally {
            setLoadingAnswer(false);
        }
    };

    const fetchRoadmap = async () => {
        if (!question.trim()) return;
        setLoadingRoadmap(true);
        setRoadmap([]);
        setError("");
        setExplanation("");
        setSelectedTopic(null);
        setTopicExplanation("");

        try {
            const subject = inferSubjectFromText(selectedTopic || question || '');
            const res = await fetch(`${BASE_URL}/api/ask/roadmap`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question, grade, subject }),
            });
            const data = await res.json();
            const normalized = Array.isArray(data.roadmap)
                ? data.roadmap.map((item, index) => normalizeRoadmapItem(item, index))
                : [];
            setRoadmap(normalized);
        } catch (err) {
            setError("⚠️ Could not generate roadmap.");
        } finally {
            setLoadingRoadmap(false);
        }
    };

    const fetchTopicExplanation = async (topic) => {
        setSelectedTopic(topic);
        setTopicExplanation("");
        setLoadingTopic(true);
        setLearningMode("explain");

        try {
            const subject = inferSubjectFromText(topic || selectedTopic || question || '');
            const res = await fetch(`${BASE_URL}/api/ask/explain`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic, grade, subject }),
            });
            const data = await res.json();
            setTopicExplanation(data.explanation || "");
            if (!completedTopics.includes(topic)) {
                setCompletedTopics(prev => [...prev, topic]);
            }
        } catch (err) {
            setTopicExplanation("⚠️ Error loading details.");
        } finally {
            setLoadingTopic(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) askAI();
    };

    return (
        <div className="py-8 max-w-5xl mx-auto px-4">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex-1">
                    <h1 className="text-4xl font-extrabold mb-3 flex items-center gap-3 text-white">
                        <span className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-600/30">
                            <Lightbulb className="text-white" size={28} />
                        </span>
                        Master Any Concept
                    </h1>
                    <p className="text-neutral-400 text-lg max-w-xl">
                        BloomAI creates a personalized path for you to understand complex topics with ease.
                    </p>
                </motion.div>

                {/* Progress Widget */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-neutral-800/50 border border-neutral-700/50 p-5 rounded-2xl w-full md:w-64 backdrop-blur shadow-xl"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                            <Target size={14} className="text-indigo-400" /> Today's Learning
                        </h3>
                        <span className="text-xs font-bold text-indigo-400">{completedTopics.length}/5</span>
                    </div>
                    <div className="space-y-3">
                        {completedTopics.slice(-3).map((topic, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-neutral-200">
                                <CheckCircle2 size={14} className="text-green-500" />
                                <span className="truncate">{topic}</span>
                            </div>
                        ))}
                        {completedTopics.length === 0 && <p className="text-xs text-neutral-600 italic">No topics started yet</p>}
                    </div>
                </motion.div>
            </div>

            {/* Main Search Panel */}
            <div className="bg-neutral-800 border border-neutral-700 p-2 rounded-2xl shadow-2xl mb-12 flex gap-2">
                <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder='Explain "Quantum Computing" or "Global Warming" or "Fractions"'
                    className="flex-1 bg-transparent p-4 text-white placeholder-neutral-500 focus:outline-none text-lg"
                />
                <button
                    onClick={askAI}
                    disabled={loadingAnswer || !question.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                >
                    {loadingAnswer ? <Loader2 size={24} className="animate-spin" /> : <Send size={20} />}
                    <span className="hidden sm:inline">Seek Answer</span>
                </button>
                <button
                    onClick={fetchRoadmap}
                    disabled={loadingRoadmap || !question.trim()}
                    className="bg-neutral-700 hover:bg-neutral-600 text-white font-bold px-6 py-4 rounded-xl transition-all disabled:opacity-50"
                    title="Build Roadmap"
                >
                    {loadingRoadmap ? <Loader2 size={24} className="animate-spin" /> : <Map size={24} />}
                </button>
            </div>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="p-4 bg-red-900/30 border border-red-700 rounded-xl text-red-300 mb-6 text-sm">
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Result Section (Left side) */}
                <div className="lg:col-span-8">
                    <AnimatePresence mode="wait">
                        {(loadingAnswer || explanation || loadingTopic || topicExplanation) && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="bg-neutral-800/90 border border-neutral-700 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm shadow-indigo-500/5 mb-8"
                            >
                                {/* Concept Illustration */}
                                <div className="h-64 overflow-hidden relative group">
                                    <img
                                        src={`https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=800&h=300&topic=${selectedTopic || question}`}
                                        alt="Topic preview"
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1000"; }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent" />
                                    <div className="absolute bottom-6 left-6 flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl border border-white/20">
                                            {getConceptIcon(selectedTopic || question)}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-white drop-shadow-lg">{selectedTopic || question}</h2>
                                            <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Level: Grade {grade}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Learning Modes Tabs */}
                                <div className="flex border-b border-neutral-700 bg-neutral-900/50 p-2">
                                    {['explain', 'infographic', 'flashcards'].map(mode => (
                                        <button
                                            key={mode}
                                            onClick={() => setLearningMode(mode)}
                                            className={`px-6 py-3 rounded-xl text-sm font-bold capitalize transition-all ${learningMode === mode ? 'bg-indigo-600 text-white shadow-lg' : 'text-neutral-500 hover:text-neutral-300'}`}
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>

                                {/* Main Content */}
                                <div className="p-8">
                                    {loadingAnswer || loadingTopic ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-neutral-500 gap-4">
                                            <Loader2 className="animate-spin text-indigo-500" size={48} />
                                            <p className="font-bold text-lg animate-pulse tracking-wide">BloomAI is tailoring your explanation...</p>
                                        </div>
                                    ) : (
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={learningMode}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                {learningMode === 'explain' && (
                                                    <div className="prose prose-invert max-w-none">
                                                        {renderText(topicExplanation || explanation)}
                                                    </div>
                                                )}
                                                {learningMode === 'infographic' && (
                                                    <RenderInfographic text={topicExplanation || explanation} topic={selectedTopic || question} />
                                                )}
                                                {learningMode === 'flashcards' && (
                                                    <div className="max-w-md mx-auto py-8">
                                                        <Flashcard
                                                            question={`Tell me more about ${selectedTopic || question}`}
                                                            answer={topicExplanation || explanation}
                                                        />
                                                        <p className="text-center text-neutral-500 text-xs mt-6 font-medium">Click card to test your knowledge!</p>
                                                    </div>
                                                )}
                                            </motion.div>
                                        </AnimatePresence>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Vertical Learning Path (Right side) */}
                <div className="lg:col-span-4">
                    <AnimatePresence>
                        {roadmap.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="sticky top-8 bg-neutral-800/40 p-6 rounded-3xl border border-neutral-700/50 backdrop-blur"
                            >
                                <h2 className="text-xl font-black mb-8 flex items-center gap-3">
                                    <Layers className="text-indigo-400" /> Mastery Path
                                </h2>

                                <div className="relative pl-8 border-l-2 border-dashed border-indigo-500/30 ml-4 space-y-12">
                                    {roadmap.map((topic, index) => {
                                        const isFinal = index === roadmap.length - 1;
                                        const isSelected = selectedTopic === topic;
                                        const isCompleted = completedTopics.includes(topic);

                                        return (
                                            <motion.div
                                                key={`${topic}-${index}`}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.15 }}
                                                className="relative"
                                            >
                                                {/* Node Point */}
                                                <div className={`absolute -left-12 top-0 w-8 h-8 rounded-full border-4 border-neutral-900 flex items-center justify-center z-10 
                                                    ${isFinal ? 'bg-amber-400 text-amber-950 scale-125 shadow-lg shadow-amber-500/30' :
                                                        isCompleted ? 'bg-green-500 text-white' :
                                                            isSelected ? 'bg-indigo-500 text-white' : 'bg-neutral-700 text-neutral-400'}`}>
                                                    {isFinal ? <Star size={12} weight="fill" /> : isCompleted ? <CheckCircle2 size={12} /> : index + 1}
                                                </div>

                                                {/* Topic Card */}
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => fetchTopicExplanation(topic)}
                                                    className={`w-full text-left p-4 rounded-2xl border transition-all shadow-lg
                                                        ${isSelected
                                                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-indigo-600/30 ring-4 ring-indigo-500/10'
                                                            : 'bg-neutral-800/80 border-neutral-700 text-neutral-200 hover:border-neutral-500 shadow-neutral-950/50'}`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-bold text-sm leading-tight">{topic}</span>
                                                        <ChevronRight size={14} className={isSelected ? 'text-white' : 'text-neutral-600'} />
                                                    </div>
                                                </motion.button>

                                                {/* Connection Link */}
                                                {!isFinal && (
                                                    <div className="absolute -left-8 top-10 flex flex-col items-center">
                                                        <div className="w-0.5 h-6 bg-indigo-500/20" />
                                                    </div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                <div className="mt-12 p-4 bg-indigo-600/10 rounded-2xl border border-indigo-500/20 text-center">
                                    <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest">Your Goal</p>
                                    <h4 className="text-white font-black mt-1">{question}</h4>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Global CSS for Flip Animation */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .perspective-1000 { perspective: 1000px; }
                .preserve-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </div>
    );
};

export default AskDoubt;
