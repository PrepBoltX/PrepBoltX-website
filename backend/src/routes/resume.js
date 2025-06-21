const express = require('express');
const resumeController = require('../controllers/resumeController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All resume routes are protected
router.use(authMiddleware.protect);

// Get all resumes for current user
router.get('/', resumeController.getUserResumes);

// Get resume by ID
router.get('/:id', resumeController.getResumeById);

// Upload a new resume
router.post('/upload', resumeController.uploadResume);

// Analyze resume using AI
router.post('/:id/analyze', resumeController.analyzeResume);

// Delete resume
router.delete('/:id', resumeController.deleteResume);

module.exports = router; 