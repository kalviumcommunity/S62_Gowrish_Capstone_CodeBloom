# CodeBloom Frontend

The client-side application for **CodeBloom**, an interactive AI-powered coding gateway. Built as a Single Page Application (SPA), it provides curated coding resource pathways, user authentication, and the **CodeBloom Learning Studio** for AI-driven topic exploration, interactive quizzes with instant feedback, and on-demand PDF study guide downloads.

---

## 🛠️ Technologies Used

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 6](https://vitejs.dev/) with `@vitejs/plugin-react`
- **Routing**: [React Router v7](https://reactrouter.com/) (`react-router-dom`)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/) (emerald brand theme)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

Commands can be run directly from the repository root using `--prefix`:

### 1. Install Dependencies
```bash
npm install --prefix frontend
```

### 2. Configure Environment (Optional)
By default, the frontend connects to the backend at `http://localhost:8080`. To configure a custom API endpoint (e.g. for deployed environments), define `VITE_API_URL` in a `frontend/.env` file:

```bash
VITE_API_URL=http://localhost:8080
```

### 3. Start Development Server
```bash
npm run dev --prefix frontend
```
The application will launch on [http://localhost:5173](http://localhost:5173).

### 4. Build & Lint
```bash
# Run ESLint
npm run lint --prefix frontend

# Create production build (outputs to frontend/dist/)
npm run build --prefix frontend

# Preview production build
npm run preview --prefix frontend
```

---

## 🧭 Application Routes

- `/` – Landing page featuring curated platform directory by age group, resource pathways, and feature overview.
- `/studio`, `/learn` – CodeBloom Learning Studio for generating AI curricula, quizzes, and downloadable PDF study notes.
- `/login` – User sign-in with JWT token and safe user session persistence in `localStorage`.
- `/signup` – User account registration.

---

## 📖 Complete Documentation

For the complete full-stack architecture, Express API endpoints, MongoDB setup, and local development instructions, see the primary [README.MD](../README.MD) in the repository root.
