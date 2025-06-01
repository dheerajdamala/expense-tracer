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

if (process.env.NODE_ENV === 'production') {
job.start(); // Start the cron job if in production
}

//midleware
app.use(cors());
app.use(rateLimiter);
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/api/health', (req, res) => {

  res.status(200).json({status: 'ok' });
});

app.use("/api/transactions", transactionRoute);

initDB().then(() => {
   

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
}).catch(error => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});


