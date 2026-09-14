const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// MongoDB Atlas Connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Atlas Connected'))
  .catch((err) => console.log('❌ MongoDB Error:', err.message));

// Routes
app.get('/', (req, res) => res.json({ message: 'RSPF API running 🚀' }));
app.use('/api/auth', authRoutes);
app.get('/api/profile', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));