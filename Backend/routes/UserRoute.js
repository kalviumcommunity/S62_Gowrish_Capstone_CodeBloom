const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/UserModel.js');

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const { email } = req.query;
    if (email) {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.json(user);
    }
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve users' });
  }
});

module.exports = router;