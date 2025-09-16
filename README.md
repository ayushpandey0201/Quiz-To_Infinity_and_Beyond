# TO INFINITY & BEYOND - Quiz Game 🚀

A production-ready, full-stack quiz event web application built with Next.js, MongoDB, Redis, and Socket.IO. Perfect for hosting interactive movie trivia competitions with real-time updates and team-based gameplay.

## ✨ Features

### Admin Section
- 🎮 Create and manage quiz games
- 🎬 Add movies (up to 30 per game)
- ❓ Create questions for three difficulty levels (Easy, Medium, Hard)
- ▶️ Start, restart, and manage game states
- 📊 Real-time game monitoring and analytics

### Play Game Section
- 👥 Team-based gameplay
- 🎯 Interactive movie grid with question counts
- 🎲 Question answering with strategic pass functionality
- 🏆 Real-time leaderboard updates via Socket.IO
- 📈 Dynamic scoring system with penalties and bonuses

## 🛠 Tech Stack

- **Frontend**: Next.js 15 with App Router, React 19, TypeScript, Tailwind CSS 4
- **Backend**: Next.js API Routes, Socket.IO for real-time updates
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis for performance optimization and session management
- **Authentication**: JWT-based admin authentication with bcrypt
- **Deployment**: Docker & Docker Compose
- **Development**: ESLint, TypeScript strict mode

## 🎯 Scoring Rules

- **Easy Questions**: +300 points (correct), -150 points (wrong)
- **Medium Questions**: +600 points (correct), -300 points (wrong)  
- **Hard Questions**: +1000 points (correct), -500 points (wrong)
- **Passed Questions**: 50% points if answered correctly, 25% deduction if wrong

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker and Docker Compose (recommended)
- Or MongoDB and Redis running locally

### Option 1: Docker Setup (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd tib
```

2. Start the services:
```bash
docker-compose up -d
```

3. The application will be available at `http://localhost:3000`

### Option 2: Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables by creating `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/quiz-app
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-here
ADMIN_PASSWORD_HASH=your-bcrypt-hashed-password
```

3. Start MongoDB and Redis locally

4. Run the development server using the provided script:
```bash
# Option 1: Use the development script
./start-dev.sh

# Option 2: Direct npm command
npm run dev
```

The `start-dev.sh` script will verify your environment configuration before starting the server.

## Usage

### Admin Access
1. Go to `http://localhost:3000`
2. Click "Admin Panel" or visit `/admin`
3. Login with password: `admin123` (default)
4. Create games, add movies, and manage questions

### Playing Games
1. Go to `http://localhost:3000`
2. Click "Play Game"
3. Select a game to join
4. Set up teams when prompted
5. Click on movie cards to access questions by difficulty level

## 🔧 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/quiz-app` | ✅ |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` | ❌ |
| `JWT_SECRET` | Secret for JWT token signing | `your-secret-key-here` | ✅ |
| `ADMIN_PASSWORD_HASH` | Bcrypt hash of admin password | Hash of `admin123` | ❌ |
| `NODE_ENV` | Environment mode | `development` | ❌ |
| `NEXT_PUBLIC_APP_URL` | Public app URL for CORS | `http://localhost:3000` | ❌ |

**Note**: The Docker setup automatically configures MongoDB with the credentials specified in `docker-compose.yml`.

## 📡 API Endpoints

### Games
- `GET /api/games` - List all games
- `POST /api/games` - Create new game
- `GET /api/games/[id]` - Get game details
- `PUT /api/games/[id]` - Update game
- `DELETE /api/games/[id]` - Delete game
- `POST /api/games/[id]/start` - Start game
- `POST /api/games/[id]/restart` - Restart game

### Movies & Questions
- `GET /api/games/[gameId]/movies` - List movies in game
- `POST /api/games/[gameId]/movies` - Add movie to game
- `POST /api/questions` - Create question
- `POST /api/questions/[id]/open` - Open question for answering
- `POST /api/questions/[id]/answer` - Submit answer
- `POST /api/questions/[id]/pass` - Pass question to next team

### Teams & Leaderboard
- `GET /api/games/[gameId]/teams` - Get teams
- `POST /api/games/[gameId]/teams` - Create teams
- `GET /api/games/[gameId]/leaderboard` - Get leaderboard

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/verify` - Verify token

## 📊 Data Models

### Game
```typescript
{
  _id: ObjectId,
  title: string,
  description: string,
  movies: ObjectId[], // Movie references
  status: 'not-started' | 'live' | 'finished',
  createdAt: Date,
  updatedAt: Date
}
```

### Movie
```typescript
{
  _id: ObjectId,
  gameId: ObjectId,
  title: string,
  index: number,
  levels: {
    easy: ObjectId,   // Level reference
    medium: ObjectId,
    hard: ObjectId
  }
}
```

### Question
```typescript
{
  _id: ObjectId,
  gameId: ObjectId,
  movieId: ObjectId,
  level: 'easy' | 'medium' | 'hard',
  text: string,
  options: [string, string, string, string],
  correctIndex: number,
  opened: boolean,
  passHistory: Array<{
    fromTeam: number,
    toTeam: number,
    at: Date
  }>
}
```

### Team
```typescript
{
  _id: ObjectId,
  gameId: ObjectId,
  teamNumber: number,
  score: number,
  correctCount: number,
  wrongCount: number
}
```

## 🔨 Development

### Project Structure
```
src/
├── app/                 # Next.js 15 app router pages
│   ├── api/            # API routes & endpoints
│   ├── admin/          # Admin dashboard interface
│   ├── play/           # Game interface & team management
│   └── login/          # Authentication pages
├── contexts/           # React contexts (Auth, Game state)
└── components/         # Reusable UI components

backend/                 # Backend logic (following user preference)
├── models/             # MongoDB schemas & models
│   ├── Game.ts         # Game management
│   ├── Movie.ts        # Movie data structure
│   ├── Question.ts     # Question & answer logic
│   ├── Team.ts         # Team scoring & management
│   └── Level.ts        # Difficulty level management
├── lib/                # Core utilities
│   ├── auth.ts         # JWT & password authentication
│   ├── mongodb.ts      # Database connection
│   ├── redis.ts        # Redis cache management
│   └── scoring.ts      # Game scoring algorithms
└── socket/             # Real-time communication
    └── socketHandler.ts # Socket.IO event handlers

types/                   # TypeScript definitions
├── global.d.ts         # Global type declarations

config/
├── docker-compose.yml  # Docker services configuration
├── Dockerfile          # Application containerization
├── mongo-init.js       # MongoDB initialization script
└── start-dev.sh        # Development startup script
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run docker:up` - Start Docker containers
- `npm run docker:down` - Stop Docker containers
- `npm run docker:logs` - View Docker logs

## 🚀 Production Deployment

1. Build the Docker image:
```bash
docker build -t quiz-app .
```

2. Run with docker-compose:
```bash
docker-compose -f docker-compose.yml up -d
```

3. Set environment variables for production:
- Change `ADMIN_PASSWORD_HASH` to a secure password
- Set strong `JWT_SECRET`
- Configure MongoDB and Redis URLs

## 🔒 Security Notes

- ⚠️ **Critical**: Change the default admin password (`admin123`) in production
- 🔑 Use strong, randomly generated JWT secrets (minimum 256-bit)
- 🌐 Configure proper CORS settings for your domain
- 🔐 Always use HTTPS in production environments
- 🛡️ Secure MongoDB and Redis instances with authentication
- 📊 Regularly update dependencies for security patches
- 🚫 Never commit `.env` files or secrets to version control

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. 🍴 Fork the repository
2. 🌿 Create a feature branch (`git checkout -b feature/amazing-feature`)
3. ✨ Make your changes with clear, concise commits
4. 🧪 Test thoroughly (ensure all game flows work)
5. 📝 Update documentation if needed
6. 🔀 Submit a pull request with a detailed description

### Development Guidelines
- Follow TypeScript best practices
- Use meaningful commit messages
- Ensure responsive design
- Test both admin and player workflows
- Maintain backward compatibility

## 📋 Database Initialization

The project includes a MongoDB initialization script (`mongo-init.js`) that:
- Creates required collections with proper validation
- Sets up performance indexes
- Configures unique constraints for teams
- Optimizes queries for real-time gameplay

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for epic quiz battles! 🚀**