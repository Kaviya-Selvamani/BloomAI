import { motion } from 'framer-motion';
import { BookCheck, Flame, Trophy } from 'lucide-react';

export default function Sidebar() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4 sticky top-24"
    >
      <div className="card rounded-xl shadow-lg p-5">
        <h3 className="text-lg font-poppins mb-4">Learning Progress</h3>
        <div className="space-y-4 text-sm">
          <div>
            <div className="flex justify-between mb-1 text-slate-600 dark:text-slate-300">
              <span>Overall Mastery</span>
              <span className="font-semibold">42%</span>
            </div>
            <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: '42%' }} />
            </div>
          </div>

          <div className="rounded-xl bg-indigo-50 dark:bg-indigo-500/10 p-3">
            <p className="font-semibold flex items-center gap-2"><Flame size={16} /> 4 Day Streak</p>
            <p className="text-slate-600 dark:text-slate-300 mt-1">Keep practicing to grow consistency.</p>
          </div>

          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 p-3">
            <p className="font-semibold flex items-center gap-2"><BookCheck size={16} /> Recent Activity</p>
            <ul className="mt-2 space-y-1 text-slate-600 dark:text-slate-300">
              <li>Fractions: 2 lessons completed</li>
              <li>Photosynthesis: 1 practice done</li>
            </ul>
          </div>

          <button className="btn-primary w-full justify-center rounded-xl">Continue Roadmap</button>
          <button className="w-full rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 font-semibold flex items-center justify-center gap-2">
            <Trophy size={16} /> View Achievements
          </button>
        </div>
      </div>
    </motion.div>
  );
}
