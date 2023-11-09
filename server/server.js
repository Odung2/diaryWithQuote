// server.js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Dummy quotes data
const quotes = [
  { id: 1, quote: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
  // ... 추가 명언들
];

// API to get a random quote
app.get('/api/quote', (req, res) => {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];
  res.json(randomQuote);
});

// API to add a new quote
app.post('/api/quote', (req, res) => {
  const { quote, author } = req.body;
  const newQuote = { id: quotes.length + 1, quote, author };
  quotes.push(newQuote);
  res.status(201).json(newQuote);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
