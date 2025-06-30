// server.js - Updated static file serving
const express = require('express');
const app = express();
const path = require('path');

// Correct static file serving
app.use(express.static(path.join(__dirname, 'public')));

// Add this before the catch-all route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Keep this as fallback for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
