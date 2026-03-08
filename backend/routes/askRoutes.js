const express = require('express');
const { askAI, getRoadmap, getDiagnostic, getFinalQuiz, trackProgress, explainTopicHandler, getHistory, getFlashcards, getDeepDive, saveHistory } = require('../controllers/learningController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// ─── Main AI ask endpoint ────────────────────────────────────────────────────
router.post('/', verifyToken, askAI);

// ─── Diagnostic ───────────────────────────────────────────────────────────────
router.post('/diagnostic', verifyToken, getDiagnostic);

// ─── Roadmap generation ───────────────────────────────────────────────────────
router.post('/roadmap', verifyToken, getRoadmap);

// ─── Topic explanation ────────────────────────────────────────────────────────
router.post('/explain', verifyToken, explainTopicHandler);

// ─── Final Quiz & Metrics ─────────────────────────────────────────────────────
router.post('/quiz/generate', verifyToken, getFinalQuiz);
router.post('/track', verifyToken, trackProgress);
router.get('/history/:userId', verifyToken, getHistory);

// ─── Interactive Modes ───────────────────────────────────────────────────────
router.post('/flashcards', verifyToken, getFlashcards);
router.post('/deep-dive', verifyToken, getDeepDive);
router.post('/save', verifyToken, saveHistory);

module.exports = router;
