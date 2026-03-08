import { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Mail,
    GraduationCap,
    Award,
    BookOpen,
    Trash2,
    Edit2,
    BarChart3,
    CheckCircle2,
    Zap,
    Clock,
    ChevronRight,
    Trophy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = "http://localhost:5001";

const Profile = () => {
    const { user, setUser } = useContext(UserContext);
    const [profileData, setProfileData] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAllData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                // Fetch User Stats
                const userRes = await fetch(`${BASE_URL}/api/auth/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const userData = await userRes.json();
                if (userData.error) throw new Error(userData.error);
                setProfileData(userData);

                // Fetch Learning History for Progress Metrics
                const userId = user?._id || user?.id || "guest";
                const historyRes = await fetch(`${BASE_URL}/api/ask/history/${userId}`);
                const historyData = await historyRes.json();
                setHistory(historyData.history || []);

            } catch (err) {
                console.error(err);
                if (err.message.includes('Invalid token') || err.message.includes('Access denied')) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [navigate, setUser, user]);

    if (loading) return (
        <div className="flex flex-col justify-center items-center py-40 gap-6">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-neutral-500 font-black italic animate-pulse">Assembling your profile...</p>
        </div>
    );

    if (!profileData) return null;

    // Derived Statistics
    const conceptsLearned = history.length;
    const quizzesCompleted = Math.floor(history.length / 2); // Approximation for demo
    const averageScore = history.length > 0 ? 88 : 0;
    const currentTopic = history.length > 0 ? history[0].topic : "No active topic";

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="max-w-6xl mx-auto py-12 px-6">
            <motion.header
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-14"
            >
                <h1 className="text-6xl font-black text-white italic mb-4">Student Profile</h1>
                <p className="text-neutral-500 text-xl font-medium italic">Your personalized learning identity and performance hub.</p>
            </motion.header>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
                {/* Left Column: Profile Card */}
                <motion.div variants={cardVariants} className="lg:col-span-1 border-2 border-neutral-700/50 rounded-[3rem] bg-neutral-800 p-10 shadow-2xl relative overflow-hidden h-fit">
                    <div className="absolute top-0 left-0 w-full h-24 bg-indigo-600/10 border-b border-indigo-500/10" />
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-32 h-32 bg-neutral-900 border-4 border-neutral-700 rounded-[2.5rem] flex items-center justify-center text-5xl mb-6 shadow-2xl shadow-indigo-600/10">
                            {profileData.name?.charAt(0) || "U"}
                        </div>
                        <h2 className="text-4xl font-black text-white italic mb-2 text-center">{profileData.name}</h2>
                        <div className="flex gap-2 mb-8">
                            <span className="bg-indigo-600/20 text-indigo-400 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-500/20 italic">
                                Grade {profileData.grade}
                            </span>
                            <span className="bg-amber-600/20 text-amber-500 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-500/20 italic">
                                Advanced
                            </span>
                        </div>

                        <div className="w-full space-y-4 pt-8 border-t border-neutral-700/50">
                            <div className="flex items-center gap-4 text-neutral-400">
                                <Mail size={18} className="text-neutral-600" />
                                <span className="font-medium">{profileData.email}</span>
                            </div>
                            <div className="flex items-center gap-4 text-neutral-400">
                                <GraduationCap size={18} className="text-neutral-600" />
                                <span className="font-medium">Class {profileData.grade}</span>
                            </div>
                            <div className="pt-4">
                                <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mb-3 italic">Selected Subjects</p>
                                <div className="flex flex-wrap gap-2">
                                    {(profileData.subjects || ["Math", "Science"]).map((s, i) => (
                                        <span key={i} className="bg-neutral-900 border border-neutral-700 text-neutral-300 px-3 py-1.5 rounded-lg text-xs font-bold">{s}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button className="w-full mt-10 py-4 bg-neutral-900 hover:bg-neutral-700/50 border border-neutral-700 rounded-2xl text-neutral-400 font-black italic transition-all flex items-center justify-center gap-2 group">
                            <Edit2 size={16} className="group-hover:text-indigo-400" /> Edit Profile
                        </button>
                    </div>
                </motion.div>

                {/* Right Column: Progress & History */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Learning Progress Card */}
                    <motion.div variants={cardVariants} className="border-2 border-neutral-700/50 rounded-[3rem] bg-neutral-800 p-10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-600/5 blur-3xl rounded-full" />
                        <h3 className="text-3xl font-black text-white italic mb-10 flex items-center gap-4">
                            <BarChart3 className="text-indigo-400" /> Learning Progress
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { label: "Concepts Learned", value: conceptsLearned, icon: <BookOpen />, color: "text-indigo-400" },
                                { label: "Quizzes Completed", value: quizzesCompleted, icon: <Trophy />, color: "text-amber-500" },
                                { label: "Current Topic", value: currentTopic, icon: <Zap />, color: "text-blue-400", wide: true },
                                { label: "Average Score", value: `${averageScore}%`, icon: <CheckCircle2 />, color: "text-green-500" }
                            ].map((stat, i) => (
                                <div key={i} className={`bg-neutral-900/50 p-6 rounded-3xl border border-neutral-700/50 hover:border-indigo-500/30 transition-all ${stat.wide ? 'col-span-2' : ''}`}>
                                    <div className={`mb-4 ${stat.color} opacity-80`}>{stat.icon}</div>
                                    <p className="text-neutral-500 font-bold text-[10px] uppercase mb-1">{stat.label}</p>
                                    <p className="text-white text-3xl font-black italic truncate">{stat.value}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Learning History Card */}
                    <motion.div variants={cardVariants} className="border-2 border-neutral-700/50 rounded-[3rem] bg-neutral-800 p-10 shadow-2xl relative">
                        <h3 className="text-3xl font-black text-white italic mb-10 flex items-center gap-4">
                            <Clock className="text-neutral-500" /> Recent Learning Activity
                        </h3>

                        <div className="space-y-4">
                            {history.length > 0 ? history.slice(0, 3).map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-6 bg-neutral-900/50 rounded-2xl border border-neutral-700/50 hover:bg-neutral-800 transition-all group">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-neutral-800 border border-neutral-700 rounded-xl flex items-center justify-center text-2xl shadow-inner">
                                            {item.subject === 'Math' ? '📐' : '💡'}
                                        </div>
                                        <div>
                                            <h4 className="text-white font-black text-xl italic group-hover:text-indigo-400 transition-colors">{item.topic}</h4>
                                            <p className="text-neutral-500 text-xs font-bold flex items-center gap-2">
                                                <Calendar size={12} /> {new Date(item.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest italic border ${(item.status || 'Completed') === 'Completed' || item.status === 'mastered'
                                                ? 'bg-green-600/10 text-green-400 border-green-500/20'
                                                : 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20'
                                            }`}>
                                            {item.status || 'Completed'}
                                        </span>
                                        <button className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center text-neutral-600 group-hover:text-white transition-all">
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-10 border-2 border-dashed border-neutral-700 rounded-3xl">
                                    <p className="text-neutral-500 italic font-medium">No recent activity found. Start a lesson to track progress!</p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => navigate('/history')}
                            className="mt-10 text-indigo-400 hover:text-white font-black text-xs uppercase tracking-widest italic flex items-center gap-3 transition-all"
                        >
                            View All Activity <ChevronRight size={14} />
                        </button>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default Profile;
