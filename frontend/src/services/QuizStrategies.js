// Strategy Pattern - Different Quiz Execution Strategies
class TimedQuizStrategy {
    async executeQuiz(quiz) {
        return new Promise((resolve) => {
            // Simulate timed quiz execution
            setTimeout(() => {
                const mockResult = {
                    score: 85,
                    totalQuestions: quiz.questions.length,
                    correctAnswers: Math.floor(quiz.questions.length * 0.85),
                    timeTaken: quiz.timeLimit || 3600,
                    feedback: "Great performance! You completed the quiz within the time limit.",
                    detailedResults: quiz.questions.map((q, index) => ({
                        questionId: q.id,
                        userAnswer: index % 4,
                        correctAnswer: q.correctAnswer,
                        isCorrect: Math.random() > 0.15,
                        timeTaken: Math.floor(Math.random() * 120) + 30
                    }))
                };
                resolve(mockResult);
            }, 1000);
        });
    }
}

class AdaptiveQuizStrategy {
    async executeQuiz(quiz) {
        return new Promise((resolve) => {
            // Simulate adaptive quiz that adjusts based on performance
            setTimeout(() => {
                const mockResult = {
                    score: 78,
                    totalQuestions: quiz.questions.length,
                    correctAnswers: Math.floor(quiz.questions.length * 0.78),
                    timeTaken: Math.floor((quiz.timeLimit || 3600) * 0.9),
                    feedback: "The quiz adapted to your skill level. Consider practicing more on weak areas.",
                    detailedResults: quiz.questions.map((q, index) => ({
                        questionId: q.id,
                        userAnswer: index % 4,
                        correctAnswer: q.correctAnswer,
                        isCorrect: Math.random() > 0.22,
                        timeTaken: Math.floor(Math.random() * 150) + 20
                    }))
                };
                resolve(mockResult);
            }, 1200);
        });
    }
}

class PracticeQuizStrategy {
    async executeQuiz(quiz) {
        return new Promise((resolve) => {
            // Simulate practice quiz with immediate feedback
            setTimeout(() => {
                const mockResult = {
                    score: 92,
                    totalQuestions: quiz.questions.length,
                    correctAnswers: Math.floor(quiz.questions.length * 0.92),
                    timeTaken: Math.floor((quiz.timeLimit || 3600) * 1.2),
                    feedback: "Excellent practice session! Take your time to understand each concept.",
                    detailedResults: quiz.questions.map((q, index) => ({
                        questionId: q.id,
                        userAnswer: index % 4,
                        correctAnswer: q.correctAnswer,
                        isCorrect: Math.random() > 0.08,
                        timeTaken: Math.floor(Math.random() * 200) + 40
                    }))
                };
                resolve(mockResult);
            }, 800);
        });
    }
}

// Context for quiz strategy
class QuizContext {
    constructor(strategy) {
        this.strategy = strategy;
    }

    setStrategy(strategy) {
        this.strategy = strategy;
    }

    async executeQuiz(quiz) {
        return await this.strategy.executeQuiz(quiz);
    }
}

export { TimedQuizStrategy, AdaptiveQuizStrategy, PracticeQuizStrategy, QuizContext }; 