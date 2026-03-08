import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useContext } from 'react';
import Layout from './components/Layout';
import AIBubble from './components/AIBubble';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AskDoubt from './pages/AskDoubt';
import LearningRoadmap from './pages/LearningRoadmap';
import LearningModule from './pages/LearningModule';
import FinalQuiz from './pages/FinalQuiz';
import History from './pages/History';
import LearningStatistics from './pages/LearningStatistics';
import DiagnosticQuestions from './pages/DiagnosticQuestions';
import Profile from './pages/Profile';
import NextLearningOptions from './pages/NextLearningOptions';
import Flashcards from './pages/Flashcards';
import { UserContext } from './context/UserContext';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ask" element={<AskDoubt />} />
          <Route path="/diagnostic" element={<DiagnosticQuestions />} />
          <Route path="/roadmap" element={<LearningRoadmap />} />
          <Route path="/learn" element={<LearningModule />} />
          <Route path="/next-options" element={<NextLearningOptions />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/quiz" element={<FinalQuiz />} />
          <Route path="/statistics" element={<LearningStatistics />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  const Shell = () => {
    const location = useLocation();
    const { user } = useContext(UserContext);
    const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
    const isAuthenticated = Boolean(user && localStorage.getItem('token'));

    return (
      <Layout>
        {!isAuthPage && isAuthenticated && <AIBubble />}
        <AnimatedRoutes />
      </Layout>
    );
  };

  return (
    <Router>
      <Shell />
    </Router>
  );
}

export default App;
