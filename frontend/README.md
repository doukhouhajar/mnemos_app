# MNEMOS Frontend

React Native mobile app for MNEMOS.

## Setup

1. Install dependencies:
```bash
npm install
```

2. For iOS:
```bash
cd ios && pod install && cd ..
npm run ios
```

3. For Android:
```bash
npm run android
```

## Architecture

```
frontend/
├── src/
│   ├── components/      # React components
│   ├── services/        # API client and services
│   ├── hooks/           # Custom React hooks
│   └── screens/         # Screen components
```

## Key Components

### CalendarView
Main calendar-native UI showing learning days and due reviews.

### MemoryExperience
Displays and handles different types of retrieval experiences (free recall, application, etc.).

## Environment Variables

Create a `.env` file:
```
API_BASE_URL=http://localhost:3000
```

