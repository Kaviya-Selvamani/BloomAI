import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Target, Zap, LayoutDashboard } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[85vh] text-center px-4 relative overflow-hidden">

            {/* Background Accent */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-3xl -z-10" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <span className="bg-white dark:bg-neutral-800 text-indigo-600 dark:text-indigo-400 border border-slate-300 dark:border-neutral-700 font-medium px-4 py-1.5 rounded-full text-sm mb-6 inline-block">
                    ✨ Welcome to the Future of Learning
                </span>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
                    <span className="text-slate-900 dark:text-white">BloomAI</span> – Adaptive Learning<br />
                    <span className="text-indigo-500">for Late Bloomers</span>
                </h1>
                <p className="text-xl md:text-2xl text-slate-600 dark:text-neutral-400 max-w-2xl mx-auto mb-10 font-light">
                    AI that understands how you learn. Tailored roadmaps, adaptive teaching, and personalized pace.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link to="/signup" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold text-lg transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-1 transform">
                        Start Learning
                    </Link>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mt-24"
            >
                <div className="p-8 rounded-2xl bg-white/80 dark:bg-neutral-800/50 border border-slate-200 dark:border-neutral-700/50 backdrop-blur-xl hover:bg-white dark:hover:bg-neutral-800 transition-colors">
                    <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center mb-6 text-indigo-400">
                        <Target size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Prerequisite Detection</h3>
                    <p className="text-slate-600 dark:text-neutral-400 leading-relaxed">
                        AI detects exactly what you need to know before tackling complex topics. No gaps left behind.
                    </p>
                </div>

                <div className="p-8 rounded-2xl bg-white/80 dark:bg-neutral-800/50 border border-slate-200 dark:border-neutral-700/50 backdrop-blur-xl hover:bg-white dark:hover:bg-neutral-800 transition-colors">
                    <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center mb-6 text-indigo-400">
                        <Zap size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Adaptive Teaching</h3>
                    <p className="text-slate-600 dark:text-neutral-400 leading-relaxed">
                        Learning content adapts to your grade, diagnostic results, and preferred learning style.
                    </p>
                </div>

                <div className="p-8 rounded-2xl bg-white/80 dark:bg-neutral-800/50 border border-slate-200 dark:border-neutral-700/50 backdrop-blur-xl hover:bg-white dark:hover:bg-neutral-800 transition-colors">
                    <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center mb-6 text-indigo-400">
                        <LayoutDashboard size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Personalized Pace</h3>
                    <p className="text-slate-600 dark:text-neutral-400 leading-relaxed">
                        Take your time or zoom ahead. The system tracks your pace and adjusts difficulty seamlessly.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default LandingPage;
