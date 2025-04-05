# ETHGlobal Taipei Project

This project consists of three main components:

1. Next.js Frontend (Port 3001)
2. Express Backend (Port 3000)
3. Flask Recommendation System (Port 5000)

## Project Structure

```
.
├── frontend/          # Next.js frontend application
├── backend/          # Express backend server
└── recommendation/   # Flask recommendation system
```

## Setup Instructions

### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```

### Backend (Express)
```bash
cd backend
npm install
npm start
```

### Recommendation System (Flask)
```bash
cd recommendation
pip install -r requirements.txt
python app.py
```

## Environment Variables

Each component has its own `.env` file. Please refer to the respective directories for environment variable setup.

## API Documentation

- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- Recommendation API: http://localhost:5000