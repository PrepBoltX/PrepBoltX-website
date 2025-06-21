const Resume = require('../models/Resume');
const aiService = require('../services/aiService');

// Get all resumes for a user
exports.getUserResumes = async (req, res) => {
    try {
        const resumes = await Resume.find({ user: req.user.userId })
            .select('fileName fileType jobDescription isAnalyzed createdAt');

        res.status(200).json({ resumes });
    } catch (error) {
        console.error('Get user resumes error:', error);
        res.status(500).json({ message: 'Server error while fetching resumes' });
    }
};

// Get resume by ID
exports.getResumeById = async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.id);

        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        // Check if the resume belongs to the requesting user or user is admin
        if (resume.user.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to access this resume' });
        }

        res.status(200).json({ resume });
    } catch (error) {
        console.error('Get resume by ID error:', error);
        res.status(500).json({ message: 'Server error while fetching resume' });
    }
};

// Upload a new resume
exports.uploadResume = async (req, res) => {
    try {
        const { fileName, fileContent, fileType, jobDescription } = req.body;

        // Check for valid file type
        if (!['pdf', 'docx', 'txt'].includes(fileType)) {
            return res.status(400).json({ message: 'Invalid file type. Supported types: pdf, docx, txt' });
        }

        const resume = new Resume({
            user: req.user.userId,
            fileName,
            fileContent,
            fileType,
            jobDescription: jobDescription || ''
        });

        await resume.save();

        res.status(201).json({
            message: 'Resume uploaded successfully',
            resume: {
                id: resume._id,
                fileName: resume.fileName
            }
        });
    } catch (error) {
        console.error('Upload resume error:', error);
        res.status(500).json({ message: 'Server error while uploading resume' });
    }
};

// Analyze resume using AI
exports.analyzeResume = async (req, res) => {
    try {
        const resumeId = req.params.id;

        const resume = await Resume.findById(resumeId);
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        // Check if the resume belongs to the requesting user or user is admin
        if (resume.user.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to analyze this resume' });
        }

        // Analyze resume using AI service
        const analysis = await aiService.analyzeResume({
            resumeText: resume.fileContent,
            jobDescription: resume.jobDescription
        });

        if (!analysis) {
            return res.status(500).json({ message: 'Failed to analyze resume' });
        }

        // Update resume with analysis
        resume.analysis = {
            summary: analysis.summary,
            strengths: analysis.strengths,
            weaknesses: analysis.weaknesses,
            suggestions: analysis.suggestions,
            score: analysis.score,
            detailedFeedback: analysis.detailedFeedback
        };
        resume.isAnalyzed = true;

        await resume.save();

        res.status(200).json({
            message: 'Resume analyzed successfully',
            analysis: resume.analysis
        });
    } catch (error) {
        console.error('Analyze resume error:', error);
        res.status(500).json({ message: 'Server error while analyzing resume' });
    }
};

// Delete resume
exports.deleteResume = async (req, res) => {
    try {
        const resumeId = req.params.id;

        const resume = await Resume.findById(resumeId);
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        // Check if the resume belongs to the requesting user or user is admin
        if (resume.user.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this resume' });
        }

        await Resume.findByIdAndDelete(resumeId);

        res.status(200).json({ message: 'Resume deleted successfully' });
    } catch (error) {
        console.error('Delete resume error:', error);
        res.status(500).json({ message: 'Server error while deleting resume' });
    }
}; 