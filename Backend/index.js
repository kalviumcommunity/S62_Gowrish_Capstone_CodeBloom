require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt')
const UserRoute = require('./routes/UserRoute.js');


const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

app.use('/user', UserRoute);  

mongoose  
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Successfully connected to the DB"))
  .catch(() => console.log("Error connecting to the DB"))

  app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`)
})