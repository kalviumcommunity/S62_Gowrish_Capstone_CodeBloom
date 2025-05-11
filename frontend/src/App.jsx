import React from 'react'
import LandingPage from './pages/LandingPage'
import SignupPage from './pages/SignUp'
import LoginPage from './pages/LoginPage'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <Routes>
        <Route path = '/' element = { <LandingPage />} />
        <Route path = '/login' element = { <LoginPage />} />
        <Route path = '/signup' element = { <SignupPage />} />
      </Routes>
    </Router>
    
  )
}

export default App
