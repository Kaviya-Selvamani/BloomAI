import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Calendar, CheckCircle, BarChart3, Clock, Trophy, ChevronRight, Brain, Zap, Target } from 'lucide-react';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const BASE_URL = "http://localhost:5001";

const History = () => {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, [user]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const userId = user?._id || user?.id;
            if (!userId) {
                setLoading(false);
                return;
            }
            const res = await fetch(`${BASE_URL}/api/ask/history/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await res.json();
            const serverHistory = data.history || [];
            if (serverHistory.length > 0) {
                setHistory(serverHistory);
            } else {
                // Fallback to localStorage-stored history
                const raw = localStorage.getItem('bloom_history');
                let arr = [];
                try { arr = raw ? JSON.parse(raw) : []; } catch (e) { arr = []; }
                // Normalize shape to match server entries
                const normalized = arr.map(a => ({
                    ...a,
                    subject: a.subject || 'General',
                    _id: a._id || a.date || Math.random().toString(36).slice(2),
                    createdAt: a.date || new Date().toISOString()
                }));
                setHistory(normalized);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-6">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                    <Brain className="text-indigo-500" size={60} />
                </motion.div>
                <p className="text-neutral-500 font-black text-xl italic uppercase tracking-widest">Loading Learning Records...</p>
            </div>
        );
    }

    const getRecommendationColor = (rec = "") => {
        if (rec.includes("Mastered")) return "text-green-500";
        if (rec.includes("Revise")) return "text-amber-500";
        return "text-red-500";
    };

    return (
        <div className="max-w-6xl mx-auto py-12 px-6">
            <header className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-6xl font-black text-white italic mb-4">Learning History</h1>
                    <p className="text-neutral-500 text-xl font-medium italic">Your personalized mastery journey across academic goals.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-neutral-800 p-4 px-8 rounded-2xl border border-neutral-700 shadow-xl">
                        <p className="text-neutral-500 font-bold text-xs uppercase mb-1">Topics mastered</p>
                        <p className="text-white text-3xl font-black">{history.filter(i => i.score >= 75).length}</p>
                    </div>
                </div>
            </header>

            {history.length === 0 ? (
                <div className="bg-neutral-800/50 p-20 rounded-[3rem] text-center border-2 border-dashed border-neutral-700">
                    <Trophy className="mx-auto text-neutral-700 mb-6" size={80} />
                    <h2 className="text-3xl font-black text-white mb-4 italic">No topics started yet!</h2>
                    <p className="text-neutral-500 text-lg mb-10 max-w-md mx-auto italic font-medium">Head over to the dashboard to begin your first journey.</p>
                    <button onClick={() => navigate('/dashboard')} className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-2xl hover:bg-indigo-700 transition-all">
                        Start Learning
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {history.map((item, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            key={item._id}
                            className="bg-neutral-800 border-2 border-neutral-700/50 p-8 rounded-[2.5rem] shadow-xl group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 text-neutral-800 pointer-events-none group-hover:text-indigo-600/10 transition-colors">
                                <Trophy size={140} weight="fill" />
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                                <div className="flex items-center gap-8">
                                    <div className="w-20 h-20 bg-neutral-900 border border-neutral-700 rounded-3xl flex items-center justify-center text-4xl shadow-inner italic">
                                        {item.subject === 'Mathematics' ? '📐' : item.subject === 'Physics' ? '⚡' : '💡'}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="bg-indigo-600/20 text-indigo-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-500/20 italic">
                                                {item.subject}
                                            </span>
                                            <span className="text-neutral-500 text-xs font-bold flex items-center gap-1">
                                                <Calendar size={12} /> {new Date(item.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="text-3xl font-black text-white italic group-hover:text-indigo-400 transition-colors uppercase">{item.topic}</h3>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-4">
                                    <div className="flex items-center gap-10 bg-neutral-900/50 p-4 px-8 rounded-2xl border border-neutral-700/50">
                                        <div className="flex flex-col">
                                            <p className="text-neutral-600 font-bold text-[10px] uppercase">Score</p>
                                            <p className={`font-black text-xl italic ${item.score >= 75 ? 'text-green-500' : 'text-amber-500'}`}>{item.score}%</p>
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-neutral-600 font-bold text-[10px] uppercase">Recommendation</p>
                                            <p className={`font-black text-sm italic capitalize leading-tight ${getRecommendationColor(item.recommendation)}`}>
                                                {item.recommendation}
                                            </p>
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-neutral-600 font-bold text-[10px] uppercase">Time Spent</p>
                                            <p className="text-neutral-400 font-black text-sm italic">{Math.floor(item.timeSpent / 60)}m {item.timeSpent % 60}s</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate('/roadmap', { state: { question: item.topic } })}
                                        className="h-20 w-20 bg-neutral-900 hover:bg-indigo-600 border border-neutral-700 hover:border-indigo-400 rounded-3xl flex items-center justify-center text-white transition-all shadow-xl p-4 group-hover:rotate-6"
                                    >
                                        <RefreshCw size={32} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default History;
