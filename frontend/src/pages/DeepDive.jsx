import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowLeft, Loader2, Sparkles, Network } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const BASE_URL = "http://localhost:5001";

const DeepDive = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { topic, grade } = location.state || {};

    const [explanation, setExplanation] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!topic) {
            navigate('/dashboard');
            return;
        }
        fetchDeepDive();
    }, [topic]);

    const fetchDeepDive = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/api/ask/deep-dive`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ topic, grade })
            });
            const data = await res.json();
            setExplanation(data.explanation);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-40 gap-6">
            <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2 }}
            >
                <Search className="text-emerald-500" size={60} />
            </motion.div>
            <p className="text-neutral-500 font-black text-xl italic animate-pulse">Deep Diving into {topic}...</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <motion.header
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-14"
            >
                <button onClick={() => navigate(-1)} className="text-neutral-500 hover:text-white transition-all flex items-center gap-2 font-black italic uppercase text-xs mb-8">
                    <ArrowLeft size={16} /> Back to Options
                </button>
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-emerald-600/10 border-2 border-emerald-500/20 rounded-[2rem] flex items-center justify-center text-emerald-400">
                        <Network size={40} />
                    </div>
                    <div>
                        <h1 className="text-5xl font-black text-white italic mb-2">Deep Dive Exploration</h1>
                        <p className="text-neutral-500 font-medium italic text-lg tracking-tight">Advanced concepts & real-world applications of <b>{topic}</b>.</p>
                    </div>
                </div>
            </motion.header>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-neutral-800 border-2 border-neutral-700/50 p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <Sparkles size={200} />
                </div>

                <div className="prose prose-invert prose-emerald max-w-none">
                    <ReactMarkdown
                        components={{
                            img: ({ node, ...props }) => (
                                <img {...props} className="w-full h-auto rounded-[2rem] border-4 border-neutral-700 my-10 shadow-2xl" />
                            ),
                            h1: ({ node, ...props }) => <h1 {...props} className="text-4xl font-black italic mb-6 text-white" />,
                            h2: ({ node, ...props }) => <h2 {...props} className="text-3xl font-black italic mt-12 mb-4 text-emerald-400" />,
                            p: ({ node, ...props }) => <p {...props} className="text-neutral-300 text-lg leading-relaxed mb-6 font-medium" />,
                            li: ({ node, ...props }) => <li {...props} className="text-neutral-300 text-lg mb-2" />,
                        }}
                    >
                        {explanation}
                    </ReactMarkdown>
                </div>
            </motion.div>

            <div className="mt-16 text-center">
                <button
                    onClick={() => navigate('/quiz', { state: { topic, grade, originalQuestion: topic } })}
                    className="px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xl rounded-2xl shadow-2xl transition-all hover:scale-105 active:scale-95"
                >
                    Challenge My Mastery
                </button>
            </div>
        </div>
    );
};

export default DeepDive;
