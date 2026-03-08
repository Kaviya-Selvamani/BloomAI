import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    BookOpen,
    Zap,
    Search,
    CheckCircle2,
    ArrowRight,
    ArrowLeft
} from 'lucide-react';

const NextLearningOptions = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { topic, originalQuestion, roadmap } = location.state || {};

    if (!topic) {
        navigate('/dashboard');
        return null;
    }

    const options = [
        {
            id: 'revise',
            title: 'Revise Concept',
            description: 'Go through the explanation once more with a simpler perspective.',
            icon: <BookOpen />,
            color: 'bg-indigo-600',
            route: '/learn',
            state: { topic, mode: 'relearn', originalQuestion, roadmap }
        },
        {
            id: 'flashcards',
            title: 'Practice Flashcards',
            description: 'Test your memory with AI-generated active recall cards.',
            icon: <Zap />,
            color: 'bg-amber-500',
            route: '/flashcards',
            state: { topic, originalQuestion, roadmap }
        },
        {
            id: 'deep-dive',
            title: 'Explore Deep Dive',
            description: 'Understand advanced applications and professional insights.',
            icon: <Search />,
            color: 'bg-emerald-500',
            route: '/learn',
            state: { topic, mode: 'infographic', originalQuestion, roadmap }
        },
        {
            id: 'quiz',
            title: 'Take Final Quiz',
            description: 'Prove your mastery and unlock the next milestone.',
            icon: <CheckCircle2 />,
            color: 'bg-red-500',
            route: '/quiz',
            state: { topic, originalQuestion, roadmap }
        }
    ];

    return (
        <div className="max-w-4xl mx-auto py-20 px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
            >
                <h1 className="text-6xl font-black text-white italic mb-6">Goal Achieved! 🏆</h1>
                <p className="text-neutral-400 text-2xl font-medium italic max-w-2xl mx-auto">
                    You've finished the roadmap for <b>{topic}</b>. What would you like to do next?
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {options.map((opt, idx) => (
                    <motion.button
                        key={opt.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => navigate(opt.route, { state: opt.state })}
                        className="group relative bg-neutral-800 border-2 border-neutral-700 hover:border-indigo-500/50 p-8 rounded-[2.5rem] text-left transition-all shadow-xl hover:shadow-indigo-600/10"
                    >
                        <div className={`w-16 h-16 ${opt.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                            {opt.icon}
                        </div>
                        <h3 className="text-2xl font-black text-white italic mb-2 flex items-center gap-3">
                            {opt.title}
                            <ArrowRight className="opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all text-indigo-400" size={20} />
                        </h3>
                        <p className="text-neutral-500 font-medium italic">{opt.description}</p>
                    </motion.button>
                ))}
            </div>

            <div className="mt-16 flex justify-center">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-3 text-neutral-500 hover:text-white font-black uppercase text-xs tracking-widest italic transition-all"
                >
                    <ArrowLeft size={16} /> Return to Dashboard
                </button>
            </div>
        </div>
    );
};

export default NextLearningOptions;
