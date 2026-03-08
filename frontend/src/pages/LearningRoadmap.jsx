import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, ChevronRight, Star, ArrowLeft, Target, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

const normalizeRoadmapItem = (item, index) => {
    if (typeof item === 'string') return item.trim() || `Step ${index + 1}`;
    if (item && typeof item === 'object') {
        const candidate = item.title || item.step || item.topic || item.name || item.description;
        if (candidate && typeof candidate === 'string') return candidate.trim();
    }
    return `Step ${index + 1}`;
};

const LearningModule = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { question, roadmap = [] } = location.state || {};
    const normalizedRoadmap = roadmap.map((item, index) => normalizeRoadmapItem(item, index));

    const [completedSteps, setCompletedSteps] = useState([]);

    if (!question || normalizedRoadmap.length === 0) {
        navigate('/dashboard');
        return null;
    }

    const handleTopicClick = (topic, index) => {
        navigate('/learn', {
            state: {
                topic,
                roadmap: normalizedRoadmap,
                currentIndex: index,
                originalQuestion: question,
                learningStyle: location.state?.learningStyle,
                diagnosticScore: location.state?.diagnosticScore
            }
        });
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <header className="mb-16 text-center">
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 inline-flex p-4 rounded-3xl bg-indigo-600/10 border border-indigo-500/20">
                    <Map size={48} className="text-indigo-400" />
                </motion.div>
                <h1 className="text-5xl font-black text-white mb-4">Your Mastery Path</h1>
                <p className="text-neutral-400 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                    Based on your answers, BloomAI has created a step-by-step prerequisite roadmap for <b>{question}</b>.
                </p>
            </header>

            <div className="relative pl-12 border-l-4 border-dashed border-indigo-500/30 ml-8 mb-20 space-y-16">
                {normalizedRoadmap.map((topic, index) => {
                    const isFinal = index === normalizedRoadmap.length - 1;
                    return (
                        <motion.div
                            key={`${topic}-${index}`}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.15 }}
                            className="relative"
                        >
                            {/* Circle Node */}
                            <div className={`absolute -left-16 top-0 w-12 h-12 rounded-2xl border-4 border-neutral-900 flex items-center justify-center z-10 
                                ${isFinal ? 'bg-amber-400 text-amber-950 scale-125 shadow-2xl shadow-amber-500/30 ring-4 ring-amber-500/10' :
                                    'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 border-neutral-900'}`}>
                                {isFinal ? <Star size={20} fill="currentColor" /> : index + 1}
                            </div>

                            {/* Topic Card */}
                            <motion.button
                                whileHover={{ scale: 1.03, x: 10 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleTopicClick(topic, index)}
                                className={`w-full text-left p-8 rounded-3xl border shadow-2xl transition-all group relative overflow-hidden backdrop-blur-sm
                                    ${isFinal ? 'bg-neutral-800 border-amber-500 text-white' : 'bg-neutral-800 border-neutral-700 hover:border-indigo-500/50 hover:bg-neutral-700/50'}`}
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full" />
                                <div className="flex justify-between items-center relative z-10">
                                    <h3 className="text-2xl font-black">{topic}</h3>
                                    <ChevronRight size={24} className="text-neutral-600 group-hover:text-indigo-400 transition-all font-bold group-hover:translate-x-2" />
                                </div>
                                <div className="flex items-center gap-3 mt-4">
                                    <span className="text-xs bg-neutral-900 text-neutral-400 px-3 py-1 rounded-full font-black uppercase tracking-widest border border-neutral-700 border-opacity-30">
                                        Step {index + 1}
                                    </span>
                                    {isFinal && (
                                        <span className="text-xs bg-amber-400/20 text-amber-400 px-3 py-1 rounded-full font-black uppercase tracking-widest border border-amber-500/30">
                                            Destination
                                        </span>
                                    )}
                                </div>
                            </motion.button>

                            {/* Arrow Link */}
                            {!isFinal && (
                                <div className="absolute -left-10 top-16 flex flex-col items-center">
                                    <div className="w-1 h-12 bg-indigo-500/10" />
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center flex-col items-center gap-4">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="text-neutral-500 hover:text-white transition-all font-bold flex items-center gap-2 group mb-6"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Change Topic
                </button>
                <div className="p-10 bg-indigo-600/10 border border-indigo-500/30 rounded-3xl text-center backdrop-blur shadow-2xl relative overflow-hidden w-full">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
                    <Target className="text-indigo-400 mx-auto mb-4" size={32} />
                    <h4 className="text-white font-black text-2xl mb-2 italic">Ready to bloom?</h4>
                    <p className="text-neutral-400 max-w-sm mx-auto font-medium">Click on the first topic <b>{normalizedRoadmap[0]}</b> to start your lesson.</p>
                </div>
            </motion.div>
        </div>
    );
};

export default LearningModule;
