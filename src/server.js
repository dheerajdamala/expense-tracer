//const express = require('express');
import express from 'express';
import dotenv from 'dotenv';
import {initDB} from './config/db.js'; // Adjust the path as necessary
import rateLimiter from './middleware/rateLimiter.js';
import transactionRoute from './routes/transactionroutes.js'; // Adjust the path as necessary
dotenv.config();


const app = express();


//midleware
app.use(rateLimiter);
app.use(express.json());

const PORT = process.env.PORT || 3000;



app.use("/api/transactions", transactionRoute);

initDB().then(() => {
   

app.listen(PORT, () => {
  console.log('Server is running up on port: '|PORT);
});
});


