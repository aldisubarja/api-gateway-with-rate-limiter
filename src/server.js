require('dotenv').config();
const express = require('express');
const rateLimiter = require('./middleware/rateLimiter');

const app = express();

app.use(express.json());

app.get('/data', rateLimiter, (req, res) => {
  res.json({ message: 'Request successful!', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
