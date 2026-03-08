const express = require('express');
const { register, login, getProfile, updateProfile } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', register);
router.post('/login', login);
router.get('/profile', verifyToken, getProfile);
router.get('/me', verifyToken, getProfile);
router.patch('/profile', verifyToken, updateProfile);

module.exports = router;
