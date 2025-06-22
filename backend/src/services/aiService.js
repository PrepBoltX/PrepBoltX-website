const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables if not already loaded
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Use API key from environment variable
const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Function to choose AI provider based on availability
const getAIProvider = () => {
    if (process.env.GOOGLE_API_KEY) {
        return 'google';
    } else {
        throw new Error('No AI provider API key available');
    }
};

// Generate quiz using AI
exports.generateQuiz = async ({ subject, category, difficulty, numberOfQuestions, topic }) => {
    try {
        const aiProvider = getAIProvider();

        const prompt = `Generate a quiz about ${subject} ${topic ? `focusing on ${topic}` : ''} 
    with ${numberOfQuestions} questions. The quiz should be ${difficulty} difficulty level and in the category of ${category}.
    
    The response should be in JSON format with the following structure:
    {
      "title": "Quiz title",
      "description": "A brief description of the quiz",
      "questions": [
        {
          "question": "Question text",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "correctAnswer": "The correct option",
          "explanation": "Explanation of why this is the correct answer"
        }
      ]
    }
    
    Ensure that the correct answer is included in the options.`;

        let result;

        // We'll always use Google API
        const model = googleAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const response = await model.generateContent(prompt);
        const responseText = response.response.text();

        // Extract JSON from the response
        const jsonMatch = responseText.match(/```json\n([\s\S]*?)```/) ||
            responseText.match(/```\n([\s\S]*?)```/) ||
            responseText.match(/{[\s\S]*}/);

        const jsonText = jsonMatch ? jsonMatch[1] || jsonMatch[0] : responseText;
        result = JSON.parse(jsonText);

        return result;
    } catch (error) {
        console.error('AI quiz generation error:', error);
        return null;
    }
};

// Generate interview questions using AI
exports.generateInterviewQuestions = async ({ jobRole, experienceLevel, numberOfQuestions }) => {
    try {
        const prompt = `Generate ${numberOfQuestions} interview questions for a ${jobRole} position at ${experienceLevel} experience level.
    
    The response should be in JSON format with the following structure:
    {
      "questions": [
        {
          "question": "Interview question",
          "expectedAnswer": "A detailed model answer for this question",
          "tips": "Tips for answering this question effectively"
        }
      ]
    }`;

        // We'll always use Google API
        const model = googleAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const response = await model.generateContent(prompt);
        const responseText = response.response.text();

        // Extract JSON from the response
        const jsonMatch = responseText.match(/```json\n([\s\S]*?)```/) ||
            responseText.match(/```\n([\s\S]*?)```/) ||
            responseText.match(/{[\s\S]*}/);

        const jsonText = jsonMatch ? jsonMatch[1] || jsonMatch[0] : responseText;
        const result = JSON.parse(jsonText);

        return result;
    } catch (error) {
        console.error('AI interview question generation error:', error);
        return null;
    }
};

// Generate subject topic content using AI
exports.generateTopicContent = async ({ subject, topic }) => {
    try {
        const prompt = `Generate educational content about ${topic} in the subject of ${subject}.
    
    The response should be in JSON format with the following structure:
    {
      "title": "Topic title",
      "content": "Comprehensive educational content about the topic in HTML format with headings, paragraphs, lists, etc., and also explain in depth about the topic"
    }`;

        // We'll always use Google API
        const model = googleAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const response = await model.generateContent(prompt);
        const responseText = response.response.text();

        // Extract JSON from the response
        const jsonMatch = responseText.match(/```json\n([\s\S]*?)```/) ||
            responseText.match(/```\n([\s\S]*?)```/) ||
            responseText.match(/{[\s\S]*}/);

        const jsonText = jsonMatch ? jsonMatch[1] || jsonMatch[0] : responseText;
        const result = JSON.parse(jsonText);

        return result;
    } catch (error) {
        console.error('AI topic content generation error:', error);
        return null;
    }
};

// Analyze resume using AI
exports.analyzeResume = async ({ resumeText, jobDescription }) => {
    try {
        const prompt = `Analyze the following resume for a ${jobDescription || 'job application'}:
    
    RESUME:
    ${resumeText}
    
    Provide a detailed analysis including strengths, weaknesses, and suggestions for improvement.
    
    The response should be in JSON format with the following structure:
    {
      "summary": "Brief summary of the resume",
      "strengths": ["Strength 1", "Strength 2", ...],
      "weaknesses": ["Weakness 1", "Weakness 2", ...],
      "suggestions": ["Suggestion 1", "Suggestion 2", ...],
      "score": 85,
      "detailedFeedback": "Detailed feedback about the resume in HTML format"
    }`;

        // We'll always use Google API
        const model = googleAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const response = await model.generateContent(prompt);
        const responseText = response.response.text();

        // Extract JSON from the response
        const jsonMatch = responseText.match(/```json\n([\s\S]*?)```/) ||
            responseText.match(/```\n([\s\S]*?)```/) ||
            responseText.match(/{[\s\S]*}/);

        const jsonText = jsonMatch ? jsonMatch[1] || jsonMatch[0] : responseText;
        const result = JSON.parse(jsonText);

        return result;
    } catch (error) {
        console.error('AI resume analysis error:', error);
        return null;
    }
}; 