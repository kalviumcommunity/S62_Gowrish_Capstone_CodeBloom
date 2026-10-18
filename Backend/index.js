require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const UserRoute = require('./routes/UserRoute.js');
const CourseRoute = require('./routes/CourseRoute.js');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Mount routes
app.use('/user', UserRoute);
app.use('/api', CourseRoute);

// Root & Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'CodeBloom API running'
  });
});

app.get('/', (req, res) => {
  res.send('<h1>🌱 Welcome to CodeBloom API!</h1><p>Use /api/generate-course to generate courses.</p>');
});

if (process.env.MONGO_URI) {
  mongoose  
    .connect(process.env.MONGO_URI)
    .then(() => console.log("Successfully connected to the DB"))
    .catch((err) => console.log("Error connecting to the DB:", err.message));
} else {
  console.warn("⚠️ MONGO_URI not found in environment. Database connection skipped.");
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;