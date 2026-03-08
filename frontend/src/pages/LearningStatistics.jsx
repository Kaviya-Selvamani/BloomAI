import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const LearningStatistics = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { evaluation = {}, topicPerformance = [], learningProfile = {} } = state || {};

    useEffect(() => {
        if (!evaluation || !Object.keys(evaluation).length) {
            navigate('/dashboard');
        }
    }, []);

    const { accuracy, correctCount, timeTaken, recommendation } = evaluation;

    const needsImprovement = topicPerformance.filter(t => t.status === 'Needs Improvement');
    const revision = topicPerformance.filter(t => t.status === 'Revision Recommended');
    const mastered = topicPerformance.filter(t => t.status === 'Good Understanding');

    return (
        <div className="max-w-5xl mx-auto py-20 px-6">
            <header className="mb-10 text-center">
                <h1 className="text-6xl font-black text-white italic mb-2">Learning Statistics</h1>
                <p className="text-neutral-500">Performance summary and adaptive recommendations</p>
            </header>

            <div className="grid grid-cols-3 gap-6 mb-12">
                <div className="p-8 bg-red-900/20 rounded-2xl border border-red-800">
                    <h4 className="text-sm font-black uppercase text-red-300 mb-2">Needs Improvement</h4>
                    <p className="text-white text-3xl font-black italic">{needsImprovement.length}</p>
                </div>
                <div className="p-8 bg-amber-900/20 rounded-2xl border border-amber-800">
                    <h4 className="text-sm font-black uppercase text-amber-300 mb-2">Revision Recommended</h4>
                    <p className="text-white text-3xl font-black italic">{revision.length}</p>
                </div>
                <div className="p-8 bg-green-900/20 rounded-2xl border border-green-800">
                    <h4 className="text-sm font-black uppercase text-green-300 mb-2">Good Understanding</h4>
                    <p className="text-white text-3xl font-black italic">{mastered.length}</p>
                </div>
            </div>

            <div className="bg-neutral-800 p-8 rounded-2xl border border-neutral-700 mb-12">
                <h3 className="text-2xl font-black italic mb-4">Overall Score — <span className="text-4xl">{accuracy}%</span></h3>
                <p className="text-neutral-400 mb-2">Recommendation: <strong className="italic">{recommendation}</strong></p>
                <p className="text-neutral-500">Learning Style: <strong className="italic">{learningProfile.learningStyle}</strong></p>
                <p className="text-neutral-500">Avg time per topic: <strong className="italic">{learningProfile.averageTimePerTopic}s</strong></p>
            </div>

            <div className="flex gap-6 justify-center mb-12">
                <button onClick={() => navigate('/learn', { state: { topic: topicPerformance[0]?.topic, mode: 'relearn' } })} className="px-10 py-4 bg-red-600 hover:bg-red-700 rounded-2xl font-black">Relearn Concepts</button>
                <button onClick={() => navigate('/learn', { state: { topic: topicPerformance[0]?.topic, mode: 'infographic' } })} className="px-10 py-4 bg-amber-600 hover:bg-amber-700 rounded-2xl font-black">Revise Concepts</button>
                <button onClick={() => navigate('/dashboard')} className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-black">Continue to Next Topic</button>
            </div>

            <section>
                <h3 className="text-3xl font-black mb-6">Topic Breakdown</h3>
                <div className="grid gap-4">
                    {topicPerformance.map((t, idx) => (
                        <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-neutral-900 p-6 rounded-2xl border border-neutral-700 flex justify-between items-center">
                            <div>
                                <h4 className="text-xl font-black italic">{t.topic}</h4>
                                <p className="text-neutral-400">Score: {t.score}% — {t.status}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-white font-black text-2xl">{t.score}%</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default LearningStatistics;
