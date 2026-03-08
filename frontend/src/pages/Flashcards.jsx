import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ArrowLeft, RefreshCw, ChevronRight, ChevronLeft, Zap } from 'lucide-react';

const BASE_URL = "http://localhost:5001";

const Flashcards = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { topic } = location.state || {};

    const [flashcards, setFlashcards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        if (!topic) {
            navigate('/dashboard');
            return;
        }
        fetchFlashcards();
    }, [topic]);

    const fetchFlashcards = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/api/ask/flashcards`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ topic })
            });
            const data = await res.json();
            setFlashcards(data.flashcards || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-40 gap-6">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5 }}>
                <Zap className="text-amber-500" size={60} />
            </motion.div>
            <p className="text-neutral-500 font-black text-xl italic animate-pulse">Generating Flashcards...</p>
        </div>
    );

    if (flashcards.length === 0) return null;

    const card = flashcards[currentIndex];

    return (
        <div className="max-w-3xl mx-auto py-12 px-6">
            <header className="mb-14 flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="text-neutral-500 hover:text-white transition-all flex items-center gap-2 font-black italic uppercase text-xs">
                    <ArrowLeft size={16} /> Go Back
                </button>
                <div className="text-center">
                    <h1 className="text-4xl font-black text-white italic mb-1">Active Recall</h1>
                    <p className="text-amber-500 font-bold text-xs uppercase tracking-widest italic">{topic}</p>
                </div>
                <div className="w-10" />
            </header>

            <div className="flex flex-col items-center gap-12">
                <div className="w-full relative h-[400px] perspective-1000">
                    <motion.div
                        className="w-full h-full relative preserve-3d cursor-pointer"
                        initial={false}
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
                        onClick={() => setIsFlipped(!isFlipped)}
                    >
                        {/* Front Side */}
                        <div className="absolute inset-0 backface-hidden bg-neutral-800 border-4 border-neutral-700 rounded-[3rem] p-12 flex flex-col items-center justify-center text-center shadow-2xl">
                            <span className="text-neutral-600 font-black uppercase text-[10px] tracking-widest mb-8 italic">Question</span>
                            <h2 className="text-3xl font-black text-white italic leading-tight">
                                {card.question}
                            </h2>
                            <div className="mt-12 text-amber-500 font-bold text-sm italic opacity-50 flex items-center gap-2">
                                <Zap size={14} /> Click to reveal answer
                            </div>
                        </div>

                        {/* Back Side */}
                        <div className="absolute inset-0 backface-hidden bg-indigo-600 border-4 border-indigo-400 rounded-[3rem] p-12 flex flex-col items-center justify-center text-center shadow-2xl rotate-y-180">
                            <span className="text-indigo-200 font-black uppercase text-[10px] tracking-widest mb-8 italic">Answer</span>
                            <p className="text-2xl font-bold text-white italic leading-relaxed">
                                {card.answer}
                            </p>
                        </div>
                    </motion.div>
                </div>

                <div className="flex items-center gap-8">
                    <button
                        disabled={currentIndex === 0}
                        onClick={() => { setCurrentIndex(currentIndex - 1); setIsFlipped(false); }}
                        className="w-16 h-16 bg-neutral-800 border-2 border-neutral-700 rounded-2xl flex items-center justify-center text-white hover:border-indigo-500 transition-all disabled:opacity-20"
                    >
                        <ChevronLeft size={32} />
                    </button>

                    <div className="text-center pt-2">
                        <p className="text-white font-black italic text-2xl">{currentIndex + 1} / {flashcards.length}</p>
                    </div>

                    <button
                        disabled={currentIndex === flashcards.length - 1}
                        onClick={() => { setCurrentIndex(currentIndex + 1); setIsFlipped(false); }}
                        className="w-16 h-16 bg-neutral-800 border-2 border-neutral-700 rounded-2xl flex items-center justify-center text-white hover:border-indigo-500 transition-all disabled:opacity-20"
                    >
                        <ChevronRight size={32} />
                    </button>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .perspective-1000 { perspective: 1000px; }
                .preserve-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
            `}} />
        </div>
    );
};

export default Flashcards;
