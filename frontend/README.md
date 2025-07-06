# PrepBoltX Frontend

Frontend application for the PrepBoltX placement preparation platform.

## Features

- User authentication with JWT and Google OAuth
- Subject and topic management
- Quizzes and mock tests
- AI-based resume analysis
- Mock interviews
- Progress tracking and leaderboard

## Tech Stack

- React with Vite
- TailwindCSS for styling
- Context API for state management
- React Router for navigation

## Setup

1. Install dependencies:
```
npm install
```

2. Set up environment variables:
   - Copy the `sample.env` file to `.env`
   - Update the values as needed:
     - `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth client ID (required for Google login)
     - `VITE_API_URL`: Backend API URL (defaults to http://localhost:5000/api)

3. Start the development server:
```
npm run dev
```

## Build for Production

```
npm run build
```

## UI/UX Considerations

- For accessibility, form elements use `text-black` to ensure proper contrast against white backgrounds
- Responsive design with Tailwind's mobile-first approach
- Animations for better user experience

## Design Patterns

The application uses several design patterns:

- Factory Pattern for question generation
- Strategy Pattern for different quiz types
- Decorator Pattern for enhancing quiz functionality
- Singleton Pattern for user management

## Testing

```
npm run test
``` 