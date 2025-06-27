// controllers/authController.js - FIXED VERSION
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Only need one import

// Signup
exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  
  console.log('📝 Registration attempt:', { username, email, password: '***' });
  
  try {
    const exists = await User.findOne({ email });
    if (exists) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, email, password: hashed });
    
    console.log('✅ User created successfully:', newUser._id);
    res.status(201).json({ message: 'User created successfully' });
    
  } catch (err) {
    console.error("❌ Register Error:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  console.log('🔐 Login attempt for:', email);
  
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log('❌ Password mismatch for:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check if JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET not found in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }
    
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '3d' }
    );
    
    console.log('✅ Login successful for:', email);
    
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email 
      } 
    });
    
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};