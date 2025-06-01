//const express = require('express');
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import {initDB} from './config/db.js';
import job from './config/cron.js'; // Adjust the path as necessary
import rateLimiter from './middleware/rateLimiter.js';
import transactionRoute from './routes/transactionroutes.js'; // Adjust the path as necessary
dotenv.config();


const app = express();

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(rateLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check endpoint called');
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use("/api/transactions", transactionRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Something broke!', details: err.message });
});

// 404 handler
app.use((req, res) => {
  console.log(`404 - Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Not Found', path: req.url });
});

const PORT = process.env.PORT || 3000;

// Initialize database and start server
initDB()
  .then(() => {
    if (process.env.NODE_ENV === 'production') {
      job.start();
    }
    
    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
      console.log(`Health check endpoint: http://localhost:${PORT}/api/health`);
      console.log(`Transactions endpoint: http://localhost:${PORT}/api/transactions`);
    });
  })
  .catch(error => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });


