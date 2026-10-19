# CodeBloom – Interactive AI-Powered Coding Gateway

CodeBloom is a beginner-friendly developer education platform that combines curated programming learning pathways with an interactive, AI-driven **Learning Studio**. Built with a modern full-stack JavaScript architecture, CodeBloom enables learners to explore curated resources, generate personalized study guides, take interactive quizzes with instant feedback, watch relevant video tutorials, and download offline PDF study materials.

---

## 🏛️ System Architecture

CodeBloom follows a decoupled client-server architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                           │
│        React 19 + Vite + Tailwind CSS + Lucide React        │
│    Routes: / (Landing), /studio, /learn, /login, /signup    │
└──────────────┬──────────────────────────────▲───────────────┘
               │ HTTP / JSON                  │
               │ REST API Requests            │ Responses & Base64 PDF
               ▼                              │
┌─────────────────────────────────────────────┴───────────────┐
│                      Server Layer                           │
│                   Node.js + Express 5                       │
│    /user (Auth & Profiles)    |    /api (AI & Courses)      │
└──────┬──────────────────┬───────────────────┬───────────────┘
       │                  │                   │
       ▼                  ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   MongoDB    │   │Google Gemini │   │YouTube API v3│
│  (Mongoose)  │   │ 3.8-Flash    │   │  & Fallbacks │
│ User Records │   │Quiz & Content│   │ Video Search │
└──────────────┘   └──────────────┘   └──────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │    PDFKit    │
                   │In-Memory PDF │
                   │  Generation  │
                   └──────────────┘
```

- **Frontend (Client)**: A Single Page Application (SPA) built using React 19 and Vite 6, styled with Tailwind CSS, offering instant navigation, dynamic authentication state management, and real-time interactive quiz evaluation.
- **Backend (API)**: A modular Express 5 REST API running on Node.js. It manages database persistence via Mongoose, handles token-based authentication with bcryptjs and JWT, and coordinates AI and media services.
- **Resilience Layer**: The backend includes deterministic fallback engines for AI generation, YouTube search, and study guides, ensuring continuous functionality even when external API keys are absent or rate-limited.

---

## 💻 Tech Stack (Verified by Codebase)

### Frontend
- **Framework**: [React 19](https://react.dev/) (`react`, `react-dom`)
- **Build Tool**: [Vite 6](https://vitejs.dev/) with Fast Refresh (`@vitejs/plugin-react`)
- **Routing**: [React Router v7](https://reactrouter.com/) (`react-router-dom`)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/) with PostCSS & Autoprefixer (emerald color theme)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Runtime & Server**: [Node.js](https://nodejs.org/) & [Express 5](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) using [Mongoose 8](https://mongoosejs.com/)
- **Authentication**: JSON Web Tokens ([jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)) & password hashing via [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **AI Integration**: Google Gemini API (`gemini-3.8-flash` via Axios) for structured quiz questions, comprehensive study summaries, and bonus tips
- **Video Retrieval**: [YouTube Data API v3](https://developers.google.com/youtube/v3) with dynamic video thumbnail derivation and fallback cards
- **Document Generation**: [PDFKit](https://pdfkit.org/) for server-side, in-memory PDF study guide rendering
- **Utilities**: `dotenv` (environment configuration), `cors` (cross-origin resource sharing)

---

## 🚦 Main Application Routes & Endpoints

### Frontend Client Routes (`frontend/src/App.jsx`)

| Path | Component | Description |
|---|---|---|
| `/` | `LandingPage.jsx` | Landing page featuring curated platform directory by age group, platform highlights, and links to the studio. |
| `/studio`, `/learn` | `LearningStudio.jsx` | The interactive CodeBloom Learning Studio for generating courses, taking interactive quizzes, reviewing study notes, and downloading PDFs. |
| `/login` | `LoginPage.jsx` | User sign-in page; authenticates credentials against the backend and stores the JWT and safe user metadata in `localStorage`. |
| `/signup` | `SignUp.jsx` | User registration page with client-side password matching and validation. |

### Backend API Endpoints (`Backend/index.js`)

#### 1. Authentication & User Profile (`Backend/routes/UserRoute.js`)
- `POST /user/signup`: Registers a new user. Hashes the password with `bcryptjs` (salt rounds: 10) and stores the user document in MongoDB.
- `POST /user/login`: Validates email and password with `bcryptjs.compare`. Returns an HTTP 200 response with a signed 1-hour JWT token and sanitized user profile (`{ id, username, email }`).
- `GET /user` *(Protected via `authMiddleware`)*: Extracts user ID from the Bearer token and returns the authenticated user's own profile, excluding password hashes (`.select('-password')`).
- `PUT /user/:id` *(Protected via `authMiddleware`)*: Updates user profile fields; verifies that `req.user.id === req.params.id`.
- `DELETE /user/:id` *(Protected via `authMiddleware`)*: Deletes account; verifies that `req.user.id === req.params.id`.

#### 2. Learning Studio & AI Service (`Backend/routes/CourseRoute.js`)
- `POST /api/generate-course`: Accepts `{ keyword }`. Orchestrates Gemini 3.8 Flash to create:
  - Exactly 5 multiple-choice questions with options, correct answer index, and explanations.
  - A comprehensive plain-text study guide.
  - YouTube tutorial video recommendations with working URLs and derived thumbnails.
  - An actionable bonus learning tip.
- `POST /api/generate-pdf`: Accepts `{ text, filename }`. Uses PDFKit to stream in-memory PDF generation and returns base64-encoded PDF data for immediate client-side download.
- `GET /api/health`: Health status returning API availability and detection flags for `hasGeminiKey` and `hasYouTubeKey`.
- `GET /health`: Basic server liveness check.

---

## 🔐 Authentication & Session Security Flow

1. **Registration**: The user submits `username`, `email`, and `password`. The backend verifies unique email existence and stores the password hashed via `bcryptjs` (cost factor 10).
2. **Login & Token Issuance**: On valid login, the server issues a signed JWT (`SECRET`) with a 1-hour expiration.
3. **Client-Side Storage**:
   - The frontend stores the JWT token in `localStorage.getItem('token')`.
   - The frontend stores strictly sanitized user metadata (`id`, `username`, `email`) in `localStorage.getItem('user')`.
   - Passwords and password hashes are never exposed in responses or stored on the client.
4. **Navigation State**: `Navbar.jsx` listens to storage updates and route changes, displaying the active username and a working **Log Out** button when authenticated, or **Log In** / **Sign Up** buttons when logged out.
5. **Session Teardown**: Logging out clears `token` and `user` from `localStorage`, resets reactive state, dispatches an `authChange` event, and redirects to `/`.

---

## 🎨 Learning Studio Workflow

1. **Topic Input**: Users enter any coding topic (e.g., "Python Basics", "React Hooks", "CSS Flexbox") or choose an instant example topic.
2. **Parallel Generation**: The backend executes parallel promises to generate the quiz, study notes, video recommendations, and bonus tip.
3. **Resilience & Fallbacks**: If `GEMINI_API_KEY` or `YOUTUBE_API_KEY` are not configured or encounter API errors, CodeBloom falls back to built-in curriculum generators and curated video libraries without failing the request.
4. **Interactive Quiz**:
   - 5 interactive multiple-choice questions.
   - Immediate feedback on answer selection with color-coded correct/incorrect badges and explanatory breakdowns.
   - Real-time score calculation and a reset mechanism to retake the quiz.
5. **Study Guide & PDF Export**: Plain-text formatted study notes with one-click download of a professionally styled PDF document generated by PDFKit.

---

## ⚙️ Environment Configuration

The application requires environment variables defined in `Backend/.env` (refer to `Backend/.env.example`):

```bash
# Server Port (optional, defaults to 8080)
PORT=8080

# MongoDB Connection String (MongoDB Atlas or local instance)
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/codebloom?retryWrites=true&w=majority

# JWT Signing Secret (required for auth token generation)
SECRET=your_jwt_secret_key_here

# Google Gemini API Key (optional; enables live AI generation via Gemini 3.8 Flash)
GEMINI_API_KEY=your_gemini_api_key_here

# YouTube Data API v3 Key (optional; enables live tutorial search)
YOUTUBE_API_KEY=your_youtube_api_key_here
```

### Frontend Environment (`frontend/.env` - optional)
```bash
# API Base URL (defaults to http://localhost:8080 if not specified)
VITE_API_URL=http://localhost:8080
```

> **Security Note**: Never commit actual `.env` files or API secrets to version control. Both root and Backend directories include `.gitignore` rules that protect all `.env` files.

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm (v9.0.0 or higher)
- MongoDB instance (MongoDB Atlas connection string or local MongoDB daemon)

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/Gowrish07/CodeBloom.git
cd CodeBloom

# Install backend dependencies (from project root)
npm install --prefix Backend

# Install frontend dependencies (from project root)
npm install --prefix frontend
```

### 2. Configure Environment

From the project root (`CodeBloom/`), create `Backend/.env` by copying `Backend/.env.example`:

```bash
cp Backend/.env.example Backend/.env
```
Fill in your `MONGO_URI`, `SECRET`, and optionally `GEMINI_API_KEY` and `YOUTUBE_API_KEY`.

*(Note: If you navigate directly into the `Backend/` directory first, run `cp .env.example .env` instead).*

### 3. Start Development Servers

From the project root (`CodeBloom/`), start the backend server in Terminal 1:
```bash
npm start --prefix Backend
# Server runs on http://localhost:8080 (or: cd Backend && npm start)
```

In a separate terminal (Terminal 2), start the frontend Vite development server from the project root:
```bash
npm run dev --prefix frontend
# Frontend runs on http://localhost:5173 (or: cd frontend && npm run dev)
```

### 4. Build for Production

```bash
# Validate frontend compilation
npm run build --prefix frontend

# Validate frontend linting
npm run lint --prefix frontend
```

---

## 📋 Feature Status: Implemented vs. Future Scope

To ensure full transparency during technical evaluations, features are catalogued according to their verified implementation status in the codebase:

### ✅ Implemented & Verified in Codebase
- **AI Learning Studio (`/studio`, `/learn`)**: Full topic exploration with Google Gemini 3.8 Flash integration.
- **Interactive Quiz Engine**: 5-question multiple-choice quizzes with instant grading, option explanations, and score tracking.
- **Dynamic PDF Generation**: Server-side in-memory PDF generation using PDFKit with one-click download.
- **YouTube Tutorial Cards**: Live YouTube API v3 search with image thumbnail derivation and deterministic fallback tutorials.
- **JWT & bcryptjs Authentication**: Complete `/user/signup`, `/user/login`, and protected `/user` routes.
- **Safe Session Management**: Token storage in `localStorage` with zero password leakage; live navbar auth state reflection.
- **Curated Learning Gateway**: Curated platform directory on the landing page categorizing resources for various age demographics (Scratch, Khan Academy, FreeCodeCamp, CS50).
- **Graceful Error Handling & Fallbacks**: Fully functional even when external AI or video API keys are omitted.

### 🔮 Future Enhancements (Roadmap)
- **Automated Gamification**: User achievement badges, point systems, and daily learning streak tracking.
- **Community Discussion Forums**: Peer question boards and collaborative resource sharing.
- **Progress Tracking Persistence**: Storing completed quiz scores and user course history in MongoDB collections.
- **Cloud Deployment Pipeline**: Docker containerization and CI/CD pipelines for production deployments.

---

## 🔗 Project References

- **Frontend Deployment**: [https://s62-gowrish-capstone-code-bloom.vercel.app/](https://s62-gowrish-capstone-code-bloom.vercel.app/)
- **Backend Deployment**: [https://s62-gowrish-capstone-codebloom-1.onrender.com](https://s62-gowrish-capstone-codebloom-1.onrender.com)
- **Figma Design Reference**: [CodeBloom Low-Fidelity Wireframes](https://www.figma.com/design/A58cTwM9PG5Cf1Bwn6ZNys/Capstone-lowfid?node-id=0-1&t=W61AZ7CD7pmpND7k-1)
