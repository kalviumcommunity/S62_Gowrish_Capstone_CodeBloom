import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignUp";
import LearningStudio from "./pages/LearningStudio";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/studio" element={<LearningStudio />} />
        <Route path="/learn" element={<LearningStudio />} />
      </Routes>
    </Router>
  );
}

export default App;
