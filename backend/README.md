# PrepBoltX Backend

Backend API for the PrepBoltX placement preparation platform.

## Features

- User authentication and profile management
- Subject and topic management
- Quiz generation (AI-based and External API)
- Resume analyzer
- Mock interviews
- Mock tests
- Progress tracking
- Leaderboard system

## Tech Stack

- Node.js with Express.js
- MongoDB for database
- JWT for authentication
- AI services for quiz generation and content creation

## External APIs Integration

The backend integrates with the following external APIs for quiz content:

1. **OpenTrivia API** - Used for general knowledge and aptitude questions
   - Free to use, no API key required
   - Used for Aptitude and Operating System questions

2. **QuizAPI** - Used for programming and technical questions
   - Requires API key from [QuizAPI.io](https://quizapi.io/)
   - Used for DBMS, OOPs, and System Design questions

3. **Mock APIs** - Fallback when external APIs are unavailable
   - Custom-built mock APIs for all subject areas
   - Used automatically when external APIs fail

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)
- API keys for external services (optional)

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/PrepBoltX-website.git
cd PrepBoltX-website/backend
```

2. Install dependencies
```
npm install
```

3. Create a .env file in the backend directory with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
QUIZ_API_KEY=your_quizapi_key (optional)
GEMINI_API_KEY=your_gemini_api_key (optional)
OPENAI_API_KEY=your_openai_api_key (optional)
```

4. Start the development server
```
npm run dev
```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

#### Subjects
- `GET /api/subjects` - Get all subjects
- `GET /api/subjects/:id` - Get a subject by ID
- `POST /api/subjects` - Create a new subject
- `PUT /api/subjects/:id` - Update a subject
- `GET /api/subjects/:id/topics` - Get topics for a subject

#### Quizzes
- `GET /api/quizzes` - Get all quizzes
- `GET /api/quizzes/:id` - Get a quiz by ID
- `POST /api/quizzes` - Create a new quiz
- `POST /api/quizzes/generate` - Generate a quiz using AI
- `POST /api/quizzes/generate-external` - Generate a quiz using external APIs
- `POST /api/quizzes/submit` - Submit quiz attempt

## Data Generation

The backend includes tools to automatically generate content:

1. Seed the database with subjects, topics, and quizzes:
```
npm run seed
```

2. Test the external quiz API integration:
```
npm run test-external-api
```

## License

ISC 