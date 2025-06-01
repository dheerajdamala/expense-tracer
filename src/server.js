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
  const timestamp = new Date().toISOString();
  const { method, originalUrl, ip } = req;
  console.log(`${timestamp} - ${method} ${originalUrl} (${ip})`);
  next();
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(rateLimiter);

// Root endpoint handler
app.get('/', (req, res) => {
  console.log('Root endpoint accessed');
  res.status(200).json({
    status: 'ok',
    message: 'Expense Tracker API',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    endpoints: {
      health: ['/health', '/api/health'],
      transactions: ['/transactions', '/api/transactions'],
      userTransactions: ['/transactions/:userId', '/api/transactions/:userId'],
      summary: ['/transactions/summary/:userId', '/api/transactions/summary/:userId']
    }
  });
});

// Health check endpoints
const healthCheck = (req, res) => {
  console.log('Health check endpoint called');
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
};

app.get('/health', healthCheck);
app.get('/api/health', healthCheck);

// Mount transaction routes
app.use('/transactions', transactionRoute);
app.use('/api/transactions', transactionRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    error: 'Something broke!',
    details: err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`404 - Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Not Found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    availableEndpoints: {
      root: '/',
      health: ['/health', '/api/health'],
      transactions: ['/transactions', '/api/transactions'],
      userTransactions: ['/transactions/:userId', '/api/transactions/:userId'],
      summary: ['/transactions/summary/:userId', '/api/transactions/summary/:userId']
    }
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
      console.log(`\nServer is running on ${HOST}:${PORT}`);
      console.log('\nAvailable endpoints:');
      console.log('- Root:', baseUrl);
      console.log(`- Health check: ${baseUrl}/health or ${baseUrl}/api/health`);
      console.log(`- Transactions: ${baseUrl}/transactions or ${baseUrl}/api/transactions`);
      console.log(`- Transaction summary: ${baseUrl}/transactions/summary/:userId`);
      console.log(`- User transactions: ${baseUrl}/transactions/:userId`);
      console.log('\nEnvironment:', process.env.NODE_ENV || 'development');
      console.log('Proxy trusted:', app.get('trust proxy'));
      
      // Print all registered routes
      console.log('\nRegistered routes:');
      app._router.stack.forEach(r => {
        if (r.route && r.route.path) {
          console.log(`${Object.keys(r.route.methods).join(',')} ${r.route.path}`);
        }
      });
    });
  })
  .catch(error => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });


