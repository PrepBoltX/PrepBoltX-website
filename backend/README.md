# PrepBoltX Backend

Backend server for the PrepBoltX platform - an educational platform for quizzes, mock tests, interviews, and resume analysis.

## Features

- User authentication and profile management
- Quiz creation and assessment
- Mock test generation and evaluation
- AI-powered interview preparation
- Resume analysis with AI feedback
- Subject-based learning content
- Leaderboard and scoring system

## Tech Stack

- Node.js and Express
- MongoDB with Mongoose
- JWT for authentication
- OpenAI and Google Generative AI integration
- RESTful API architecture

## Setup

### Prerequisites

- Node.js (v14+ recommended)
- MongoDB (local installation or MongoDB Atlas)
- API keys for OpenAI and/or Google Generative AI

### Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```
   cd backend
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file based on `.env.example` and add your configuration:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/prepboltx
   JWT_SECRET=your_jwt_secret_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   GOOGLE_API_KEY=your_google_api_key_here
   ```
5. Start the development server:
   ```
   npm run dev
   ```
6. (Optional) Seed the database with initial data:
   ```
   npm run seed
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile

### Subjects
- `GET /api/subject` - Get all subjects
- `GET /api/subject/:id` - Get subject by ID
- `POST /api/subject` - Create a new subject (admin)
- `POST /api/subject/:id/topics` - Add topic to subject (admin)
- `POST /api/subject/:id/generate-topic` - Generate topic content using AI (admin)

### Quizzes
- `GET /api/quiz` - Get all quizzes
- `GET /api/quiz/:id` - Get quiz by ID
- `POST /api/quiz` - Create a new quiz
- `POST /api/quiz/generate` - Generate quiz using AI
- `POST /api/quiz/submit` - Submit quiz attempt

### Mock Tests
- `GET /api/mock-test` - Get all mock tests
- `GET /api/mock-test/:id` - Get mock test by ID
- `POST /api/mock-test` - Create a new mock test
- `POST /api/mock-test/generate` - Generate mock test using AI
- `POST /api/mock-test/submit` - Submit mock test attempt

### Interviews
- `GET /api/interview` - Get all interviews
- `GET /api/interview/:id` - Get interview by ID
- `POST /api/interview` - Create a new interview
- `POST /api/interview/generate` - Generate interview using AI
- `POST /api/interview/submit` - Submit interview attempt

### Resume
- `GET /api/resume` - Get all resumes for current user
- `GET /api/resume/:id` - Get resume by ID
- `POST /api/resume/upload` - Upload a new resume
- `POST /api/resume/:id/analyze` - Analyze resume using AI
- `DELETE /api/resume/:id` - Delete resume

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `PUT /api/user/change-password` - Change password
- `GET /api/user/quiz-history` - Get user's quiz history
- `GET /api/user/mock-test-history` - Get user's mock test history

### Leaderboard
- `GET /api/leaderboard` - Get global leaderboard
- `GET /api/leaderboard/quiz/:quizId` - Get quiz leaderboard
- `GET /api/leaderboard/rank` - Get current user's rank 