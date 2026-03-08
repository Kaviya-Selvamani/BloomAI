import { useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { updateUserProfile } from '../services/api';
import { UserContext } from '../context/UserContext';
import { ArrowRight, Calculator, FlaskConical, Search, BookOpenText, GraduationCap, Lightbulb } from 'lucide-react';

const gradeSubjectMap = {
  '8': ['Math', 'Science', 'English', 'Social Science'],
  '10': ['Math', 'Science', 'English', 'Social Science'],
  '12': ['Math', 'Physics', 'Chemistry', 'Biology', 'English'],
};

const subjectDetails = {
  Math: {
    icon: Calculator,
    description: 'Build confidence with numbers, equations, and real-world problem solving.',
    color: 'from-sky-100 to-indigo-100 dark:from-sky-500/20 dark:to-indigo-500/20',
  },
  Mathematics: {
    icon: Calculator,
    description: 'Build confidence with numbers, equations, and real-world problem solving.',
    color: 'from-sky-100 to-indigo-100 dark:from-sky-500/20 dark:to-indigo-500/20',
  },
  Science: {
    icon: FlaskConical,
    description: 'Explore experiments, ideas, and scientific thinking step by step.',
    color: 'from-emerald-100 to-cyan-100 dark:from-emerald-500/20 dark:to-cyan-500/20',
  },
  English: {
    icon: BookOpenText,
    description: 'Improve reading, writing, and communication with guided practice.',
    color: 'from-amber-100 to-orange-100 dark:from-amber-500/20 dark:to-orange-500/20',
  },
  Physics: {
    icon: FlaskConical,
    description: 'Understand motion, force, energy, and modern physics concepts.',
    color: 'from-violet-100 to-indigo-100 dark:from-violet-500/20 dark:to-indigo-500/20',
  },
  Chemistry: {
    icon: FlaskConical,
    description: 'Master reactions, atoms, and bonding through visual explanations.',
    color: 'from-pink-100 to-rose-100 dark:from-pink-500/20 dark:to-rose-500/20',
  },
  Biology: {
    icon: FlaskConical,
    description: 'Study life systems, cells, and ecosystems with clear concept maps.',
    color: 'from-lime-100 to-emerald-100 dark:from-lime-500/20 dark:to-emerald-500/20',
  },
  'Social Science': {
    icon: BookOpenText,
    description: 'Learn history, civics, geography, and society through clear concept maps.',
    color: 'from-orange-100 to-red-100 dark:from-orange-500/20 dark:to-red-500/20',
  },
  Others: {
    icon: Lightbulb,
    description: 'Choose any other subject or topic not listed above.',
    color: 'from-slate-100 to-slate-200 dark:from-slate-600/30 dark:to-slate-700/30',
  },
};

const getSubjectCard = (name) => {
  return subjectDetails[name] || {
    icon: Lightbulb,
    description: `Learn ${name} with personalized BloomAI guidance.`,
    color: 'from-slate-100 to-slate-200 dark:from-slate-600/30 dark:to-slate-700/30',
  };
};

const Dashboard = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [question, setQuestion] = useState('');
  const [toast, setToast] = useState(null);

  const name = user?.name || 'Student';
  const grade = String(user?.grade || '10');

  const subjects = useMemo(() => {
    const byProfile = Array.isArray(user?.subjects) ? user.subjects.filter(Boolean) : [];
    const base = byProfile.length > 0 ? byProfile : (gradeSubjectMap[grade] || ['Math', 'Science', 'English']);
    const withOthers = [...base, 'Others'];
    const unique = [...new Set(withOthers)];
    return unique.map((name) => ({ name, ...getSubjectCard(name) }));
  }, [grade, user?.subjects]);

  const onSelectSubject = async (subject) => {
    setSelectedSubject(subject);

    const currentSubjects = Array.isArray(user?.subjects) ? user.subjects : [];
    const mergedSubjects = subject === 'Others'
      ? currentSubjects
      : [...new Set([...currentSubjects, subject])];

    const updated = {
      ...(user || {}),
      preferredSubject: subject,
      subjects: mergedSubjects,
    };

    setUser(updated);
    try {
      localStorage.setItem('user', JSON.stringify(updated));
    } catch {
      // ignore localStorage failures
    }

    try {
      if (subject !== 'Others') {
        await updateUserProfile({ subjects: mergedSubjects });
      }
    } catch {
      setToast('Could not save subject right now.');
      setTimeout(() => setToast(null), 2500);
    }
  };

  const handleAskAI = () => {
    if (!question.trim()) return;
    const subject =
      selectedSubject === 'Others'
        ? (question.trim() || 'General')
        : (selectedSubject || subjects[0]?.name || 'General');

    navigate('/diagnostic', { state: { question, subject, grade } });
  };

  return (
    <div className="py-10">
      <div className="mx-auto px-6">
        <motion.header initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="student-h1">Welcome back, {name}</h1>
          <p className="student-body mt-3 flex items-center gap-2">
            <GraduationCap size={20} className="text-indigo-600 dark:text-indigo-300" />
            Grade {grade} learning dashboard
          </p>
        </motion.header>

        {toast && (
          <div className="fixed right-6 top-20 rounded-xl bg-indigo-600 text-white px-4 py-2 shadow-lg z-50">{toast}</div>
        )}

        <AnimatePresence>
          {selectedSubject && (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="card rounded-xl shadow-lg p-5 mb-8"
            >
              <h2 className="student-h2 mb-3">
                Ask BloomAI about {selectedSubject === 'Others' ? 'your topic' : selectedSubject}
              </h2>
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                    placeholder={selectedSubject === 'Others' ? 'Type any subject/topic...' : `Type a concept in ${selectedSubject}...`}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <button onClick={handleAskAI} disabled={!question.trim()} className="btn-primary rounded-xl justify-center disabled:opacity-60">
                  Start Diagnostic <ArrowRight size={18} />
                </button>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">We’ll create a personalized concept roadmap from your question.</p>
            </motion.section>
          )}
        </AnimatePresence>

        <section className="mb-10">
          <h2 className="student-h2 mb-5">Subjects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {subjects.map((subject, idx) => {
              const Icon = subject.icon;
              return (
                <motion.div
                  key={subject.name}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  whileHover={{ y: -5 }}
                  className="card p-6 rounded-xl shadow-lg"
                >
                  <div className={`rounded-xl bg-gradient-to-br ${subject.color} p-4 mb-4 inline-flex`}>
                    <Icon className="text-indigo-700 dark:text-indigo-200" size={26} />
                  </div>
                  <h3 className="text-2xl font-poppins mb-2">{subject.name}</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-5 min-h-16">{subject.description}</p>
                  <button onClick={() => onSelectSubject(subject.name)} className="btn-primary rounded-xl w-full justify-center">
                    Start Learning
                  </button>
                </motion.div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
