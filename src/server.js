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

// Trust proxy - required for Render
app.set('trust proxy', true);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} (${req.ip})`);
  next();
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(rateLimiter);

// Create router for API endpoints
const apiRouter = express.Router();

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  console.log('Health check endpoint called');
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Mount transaction routes
apiRouter.use('/transactions', transactionRoute);

// Mount API router
app.use('/api', apiRouter);

// Root endpoint redirect
app.get('/', (req, res) => {
  console.log('Root endpoint accessed, redirecting to /api/health');
  res.redirect('/api/health');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Something broke!', details: err.message });
});

// 404 handler
app.use((req, res) => {
  console.log(`404 - Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Not Found', 
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      '/api/health',
      '/api/transactions',
      '/api/transactions/:userId',
      '/api/transactions/summary/:userId'
    ]
  });
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Initialize database and start server
initDB()
  .then(() => {
    if (process.env.NODE_ENV === 'production') {
      job.start();
    }
    
    app.listen(PORT, HOST, () => {
      const baseUrl = `http://${HOST}:${PORT}`;
      console.log(`Server is running on ${HOST}:${PORT}`);
      console.log('\nAvailable endpoints:');
      console.log(`- Health check: ${baseUrl}/api/health`);
      console.log(`- Transactions: ${baseUrl}/api/transactions`);
      console.log(`- Transaction summary: ${baseUrl}/api/transactions/summary/:userId`);
      console.log(`- User transactions: ${baseUrl}/api/transactions/:userId`);
      console.log('\nEnvironment:', process.env.NODE_ENV || 'development');
      console.log('Proxy trusted:', app.get('trust proxy'));
    });
  })
  .catch(error => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });


