require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const previewRoutes = require('./routes/preview');
const fullRoutes = require('./routes/full');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS設定
const allowedOrigins = [
  'http://localhost:5173',
  'https://todo-app-b4af8.web.app'
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());
app.use('/auth', authRoutes);
app.use('/api/preview', previewRoutes);
app.use('/api/full', fullRoutes);

app.get('/', (req, res) => {
  res.send('Just Did Server is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
