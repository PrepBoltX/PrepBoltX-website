// Factory Pattern - Question Creation
class QuestionFactory {
    createQuestion(data) {
        throw new Error('Method not implemented');
    }
}

class MCQQuestionFactory extends QuestionFactory {
    createQuestion(data) {
        return {
            id: data.id || Math.random().toString(36).substr(2, 9),
            question: data.question,
            options: data.options,
            correctAnswer: data.correctAnswer,
            explanation: data.explanation,
            difficulty: data.difficulty || 'medium',
            subject: data.subject,
            type: 'mcq',
            points: this.calculatePoints(data.difficulty)
        };
    }

    calculatePoints(difficulty) {
        switch (difficulty) {
            case 'easy': return 10;
            case 'medium': return 20;
            case 'hard': return 30;
            default: return 20;
        }
    }
}

class CodingQuestionFactory extends QuestionFactory {
    createQuestion(data) {
        return {
            id: data.id || Math.random().toString(36).substr(2, 9),
            question: data.question,
            correctAnswer: data.solution,
            explanation: data.explanation,
            difficulty: data.difficulty || 'medium',
            subject: data.subject,
            type: 'coding',
            points: this.calculatePoints(data.difficulty)
        };
    }

    calculatePoints(difficulty) {
        switch (difficulty) {
            case 'easy': return 50;
            case 'medium': return 100;
            case 'hard': return 150;
            default: return 100;
        }
    }
}

class DescriptiveQuestionFactory extends QuestionFactory {
    createQuestion(data) {
        return {
            id: data.id || Math.random().toString(36).substr(2, 9),
            question: data.question,
            correctAnswer: data.modelAnswer,
            explanation: data.explanation,
            difficulty: data.difficulty || 'medium',
            subject: data.subject,
            type: 'descriptive',
            points: this.calculatePoints(data.difficulty)
        };
    }

    calculatePoints(difficulty) {
        switch (difficulty) {
            case 'easy': return 25;
            case 'medium': return 40;
            case 'hard': return 60;
            default: return 40;
        }
    }
}

// Factory selector
class QuestionFactorySelector {
    static getFactory(type) {
        switch (type.toLowerCase()) {
            case 'mcq':
                return new MCQQuestionFactory();
            case 'coding':
                return new CodingQuestionFactory();
            case 'descriptive':
                return new DescriptiveQuestionFactory();
            default:
                return new MCQQuestionFactory();
        }
    }
}

export { QuestionFactory, MCQQuestionFactory, CodingQuestionFactory, DescriptiveQuestionFactory, QuestionFactorySelector };