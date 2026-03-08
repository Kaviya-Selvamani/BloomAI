const express = require('express');
const { getLearningRoadmap, getExplanation, getHistory, saveHistory, getFlashcards, getDeepDive, importLocalHistory } = require('../controllers/learningController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Roadmap & History
router.post('/roadmap', verifyToken, getLearningRoadmap);
router.post('/explain', verifyToken, getExplanation);
router.get('/history/:userId', verifyToken, getHistory);
router.post('/save', verifyToken, saveHistory);

// Admin: import local history JSON into MongoDB (if available)
router.post('/import-local-history', verifyToken, importLocalHistory);

// Learning Modes
router.post('/flashcards', verifyToken, getFlashcards);
router.post('/deep-dive', verifyToken, getDeepDive);

module.exports = router;
