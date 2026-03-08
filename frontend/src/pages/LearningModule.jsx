import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ChevronRight, ExternalLink, Loader2 } from 'lucide-react';
import { UserContext } from '../context/UserContext';
import formatLink from '../utils/formatLink';

const BASE_URL = 'http://localhost:5001';

const KEY_TERM_REGEX = /\b(heart|blood|pumps?|oxygen)\b/gi;

const cleanMarkdownLine = (line = '') =>
  line
    .replace(/^#{1,6}\s+/, '')
    .replace(/^([-*+]|\d+\.)\s+/, '')
    .replace(/\*\*/g, '')
    .replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1$2')
    .trim();

const highlightKeyTerms = (text = '') => {
  const parts = text.split(KEY_TERM_REGEX);
  return parts.map((part, idx) =>
    /^(heart|blood|pumps?|oxygen)$/i.test(part) ? (
      <strong key={`${part}-${idx}`} className="font-bold text-xl text-amber-300">
        {part.toUpperCase()}
      </strong>
    ) : (
      <span key={`${part}-${idx}`}>{part}</span>
    ),
  );
};

const buildLearningCards = (text = '', topic = 'Concept') => {
  const rawLines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const sections = [];
  let current = { title: '', lines: [] };

  rawLines.forEach((line) => {
    const headingMatch = line.match(/^#{1,6}\s+(.+)/);
    if (headingMatch) {
      if (current.title || current.lines.length) sections.push(current);
      current = { title: cleanMarkdownLine(headingMatch[1]), lines: [] };
      return;
    }

    const cleaned = cleanMarkdownLine(line);
    if (cleaned) current.lines.push(cleaned);
  });

  if (current.title || current.lines.length) sections.push(current);

  const cards = sections
    .map((section, index) => {
      const title = section.title || `Concept ${index + 1}`;
      const explanation = section.lines.join(' ');
      return {
        id: `${title}-${index}`,
        title,
        explanation: explanation || `Understand the key ideas in ${topic}.`,
        example: `Try this: Connect ${title.toLowerCase()} to one real-life situation from your daily routine.`,
      };
    })
    .filter((card) => card.title || card.explanation);

  if (cards.length > 0) return cards.slice(0, 6);

  return [
    {
      id: 'concept-0',
      title: `What is ${topic}?`,
      explanation: `${topic} can be learned best by breaking it into small ideas and connecting them to real life.`,
      example: `Try this: Explain ${topic} to a friend using one simple day-to-day example.`,
    },
  ];
};

const getPracticeQuestion = (topic = '') =>
  `In one or two lines, explain ${topic} in your own words and include one real-world use case.`;

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
  const { user } = useContext(UserContext);
  const { topic, roadmap = [], currentIndex = 0, originalQuestion, mode } = location.state || {};
  const normalizedRoadmap = roadmap.map((item, index) => normalizeRoadmapItem(item, index));

  const [loading, setLoading] = useState(true);
  const [explanation, setExplanation] = useState('');
  const [resources, setResources] = useState([]);
  const [learningMode, setLearningMode] = useState(mode || 'explain');
  const [flashcards, setFlashcards] = useState([]);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [revealAnswer, setRevealAnswer] = useState(false);
  const [practiceAnswer, setPracticeAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [attempts] = useState(location.state?.attempts || 1);
  const [showConceptImage, setShowConceptImage] = useState(true);

  const startTime = useRef(Date.now());

  useEffect(() => {
    if (!topic) {
      navigate('/dashboard');
      return;
    }

    setShowConceptImage(true);

    const fetchExplanation = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/ask/explain`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            topic,
            grade: user?.grade,
            mode: learningMode,
            learningStyle: location.state?.learningStyle || 'medium',
          }),
        });
        const data = await res.json();
        setExplanation(data.explanation || 'No explanation available right now.');
        setResources(data.resources || []);
        startTime.current = Date.now();
      } catch (error) {
        console.error(error);
        setExplanation('Unable to load the lesson. Please retry.');
        setResources([]);
      } finally {
        if (learningMode !== 'flashcards') {
          setLoading(false);
        }
      }
    };

    const fetchFlashcards = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/ask/flashcards`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            topic,
            grade: user?.grade,
            subject: location.state?.subject || 'General',
          }),
        });
        const data = await res.json();
        const cards = Array.isArray(data.flashcards) ? data.flashcards : [];
        setFlashcards(cards);
        setActiveCardIndex(0);
        setRevealAnswer(false);
      } catch (error) {
        console.error(error);
        setFlashcards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExplanation();
    if (learningMode === 'flashcards') {
      fetchFlashcards();
    }
  }, [topic, learningMode, navigate, user?.grade, location.state?.learningStyle, location.state?.subject]);

  const conceptIllustrationUrl = useMemo(
    () => `https://source.unsplash.com/800x400/?${encodeURIComponent(topic || 'learning')},education`,
    [topic],
  );
  const learningCards = useMemo(() => buildLearningCards(explanation, topic), [explanation, topic]);
  const keyTakeaways = useMemo(() => {
    const takeaways = learningCards
      .map((card) => card.explanation.split(/(?<=[.!?])\s+/)[0]?.trim() || card.title)
      .filter(Boolean);
    return [...new Set(takeaways)].slice(0, 4);
  }, [learningCards]);
  const primaryResource = useMemo(() => {
    if (!resources || resources.length === 0) return null;
    const firstValid = resources.find((r) => r?.url);
    if (!firstValid) return null;
    return {
      title: firstValid.title || 'Concept Page',
      url: formatLink(firstValid.url),
    };
  }, [resources]);

  const handleNext = async () => {
    const timeSpent = Math.floor((Date.now() - startTime.current) / 1000);
    const nextIndex = currentIndex + 1;

    try {
      await fetch(`${BASE_URL}/api/ask/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          userId: user?._id || user?.id,
          topic,
          subject: location.state?.subject || 'General',
          pace: timeSpent > 120 ? 'slow' : timeSpent > 45 ? 'medium' : 'fast',
          accuracy: 100,
          grade: user?.grade,
        }),
      });

      await fetch(`${BASE_URL}/api/ask/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          userId: user?._id || user?.id,
          topic,
          subject: location.state?.subject || 'General',
          score: 100,
          attempts,
          timeSpent,
          recommendation: 'Keep Practicing',
          status: 'Completed',
        }),
      });
    } catch (error) {
      console.error(error);
    }

    if (nextIndex < normalizedRoadmap.length) {
      navigate('/learn', {
        state: {
          topic: normalizedRoadmap[nextIndex],
          roadmap: normalizedRoadmap,
          currentIndex: nextIndex,
          originalQuestion,
          learningStyle: location.state?.learningStyle,
          subject: location.state?.subject,
        },
        replace: true,
      });
      return;
    }

    navigate('/next-options', { state: { roadmap: normalizedRoadmap, originalQuestion, topic } });
  };

  if (!topic) return null;

  return (
    <div className="py-10">
      <div className="mx-auto px-6">
        <motion.header initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <button
              onClick={() => navigate('/roadmap', { state: { question: originalQuestion, roadmap: normalizedRoadmap } })}
              className="mt-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Step {currentIndex + 1} of {normalizedRoadmap.length || 1}</p>
              <h1 className="student-h1 mt-1 uppercase">{topic}</h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {['explain', 'story', 'infographic', 'flashcards'].map((m) => (
              <button
                key={m}
                onClick={() => setLearningMode(m)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize border transition-colors ${
                  learningMode === m
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </motion.header>

        <AnimatePresence mode="wait">
          <motion.section
            key={`${topic}-${learningMode}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="card rounded-xl shadow-lg p-6 sm:p-8"
          >
            {loading ? (
              <div className="py-20 flex flex-col items-center gap-4 text-slate-500">
                <Loader2 size={40} className="animate-spin text-indigo-600" />
                <p>Preparing your lesson...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="rounded-xl shadow-md bg-neutral-800 p-5 sm:p-6 text-neutral-100 space-y-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Concept Lesson</p>
                  <h2 className="font-semibold text-2xl">{topic}</h2>
                  {showConceptImage && (
                    <img
                      src={conceptIllustrationUrl}
                      alt={`${topic} concept illustration`}
                      className="w-full h-52 sm:h-72 rounded-xl object-cover"
                      onError={() => setShowConceptImage(false)}
                    />
                  )}
                </div>

                {primaryResource && (
                  <div className="rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/30 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300">Featured Resource</p>
                      <p className="font-semibold">{primaryResource.title}</p>
                    </div>
                    <a
                      href={primaryResource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary rounded-xl w-full sm:w-auto justify-center"
                    >
                      Open Concept Page <ExternalLink size={16} />
                    </a>
                  </div>
                )}

                {learningMode === 'flashcards' ? (
                  <div className="rounded-xl bg-indigo-50 dark:bg-indigo-500/10 p-6 border border-indigo-100 dark:border-indigo-500/30">
                    <h2 className="student-h2 mb-4 uppercase">Flashcards</h2>
                    {flashcards.length === 0 ? (
                      <p className="student-body">No flashcards available right now. Try switching mode and back.</p>
                    ) : (
                      <div className="space-y-4">
                        <motion.div whileHover={{ scale: 1.01 }} className="rounded-xl border border-indigo-200 dark:border-indigo-500/40 bg-white dark:bg-slate-900 p-5">
                          <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">
                            Card {activeCardIndex + 1} of {flashcards.length}
                          </p>
                          <h3 className="text-lg font-semibold mb-3 uppercase">{flashcards[activeCardIndex]?.question}</h3>
                          {revealAnswer ? (
                            <p className="student-body">{flashcards[activeCardIndex]?.answer}</p>
                          ) : (
                            <p className="text-slate-500 dark:text-slate-400">Think first, then reveal the answer.</p>
                          )}
                        </motion.div>
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => setRevealAnswer((v) => !v)} className="btn-primary rounded-xl">
                            {revealAnswer ? 'Hide Answer' : 'Reveal Answer'}
                          </button>
                          <button
                            onClick={() => {
                              setActiveCardIndex((prev) => (prev + 1) % flashcards.length);
                              setRevealAnswer(false);
                            }}
                            className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 font-semibold"
                          >
                            Next Card
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <section className="space-y-6">
                      {(learningMode === 'infographic' ? learningCards.slice(0, 4) : learningCards).map((card, idx) => (
                        <motion.article
                          key={card.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.06 }}
                          className="rounded-xl shadow-md bg-neutral-800 p-6 text-neutral-100 space-y-4"
                        >
                          <h3 className="font-semibold text-2xl">{card.title}</h3>
                          <p className="text-lg leading-relaxed">{highlightKeyTerms(card.explanation)}</p>
                          <div className="rounded-lg bg-neutral-700/70 p-4 space-y-2">
                            <p className="text-xs uppercase tracking-wide text-neutral-300">Example</p>
                            <p className="text-lg leading-relaxed">{highlightKeyTerms(card.example)}</p>
                          </div>
                        </motion.article>
                      ))}

                      <article className="rounded-xl shadow-md bg-neutral-800 p-6 text-neutral-100 space-y-4">
                        <h3 className="font-semibold text-2xl">Key Takeaways</h3>
                        <div className="space-y-3">
                          {(keyTakeaways.length > 0 ? keyTakeaways : [`Review the main idea of ${topic} in your own words.`]).map((item, idx) => (
                            <p key={`${item}-${idx}`} className="text-lg leading-relaxed">
                              ⭐ {highlightKeyTerms(item)}
                            </p>
                          ))}
                        </div>
                      </article>
                    </section>

                    <section className="rounded-xl shadow-md bg-neutral-800 p-6 text-neutral-100 space-y-4">
                      <h2 className="font-semibold text-2xl">Quick Practice Question</h2>
                      <p className="text-lg leading-relaxed">{getPracticeQuestion(topic)}</p>
                      <textarea
                        value={practiceAnswer}
                        onChange={(e) => {
                          setPracticeAnswer(e.target.value);
                          setShowFeedback(false);
                        }}
                        placeholder="Write your answer here..."
                        className="w-full min-h-28 rounded-xl border border-neutral-600 bg-neutral-900 p-3 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                      <div className="mt-1 flex items-center gap-3">
                        <button
                          onClick={() => setShowFeedback(true)}
                          disabled={!practiceAnswer.trim()}
                          className="btn-primary rounded-xl disabled:opacity-60"
                        >
                          Check Reflection
                        </button>
                        {showFeedback && <p className="text-sm text-neutral-300">Great effort. Focus on clarity and one concrete use-case.</p>}
                      </div>
                    </section>
                  </>
                )}
              </div>
            )}
          </motion.section>
        </AnimatePresence>

        <section className="mt-8 card rounded-xl shadow-lg p-6">
          <h2 className="student-h2 mb-4 uppercase">Recommended Resources</h2>
          <div className="space-y-3">
            {resources.length > 0 ? (
              resources.map((res, idx) => {
                const href = formatLink(res.url || res.link || '');
                return (
                  <a
                    key={`${href}-${idx}`}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:border-indigo-400 transition-colors"
                  >
                    <span className="font-medium">{res.title || href}</span>
                    <ExternalLink size={16} className="text-slate-500" />
                  </a>
                );
              })
            ) : (
              <p className="text-slate-500 dark:text-slate-400">No extra resources available for this topic yet.</p>
            )}
          </div>
        </section>

        <div className="mt-8 card rounded-xl shadow-lg p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-slate-600 dark:text-slate-300">
            {Math.max((normalizedRoadmap?.length || 1) - currentIndex - 1, 0)} concepts remaining in this roadmap.
          </p>
          <button onClick={handleNext} className="btn-primary rounded-xl">
            {currentIndex >= (normalizedRoadmap?.length || 1) - 1 ? 'Explore Next Steps' : 'Mark as Learned'}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LearningModule;
