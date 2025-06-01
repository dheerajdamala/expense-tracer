import express from 'express';
import {
  createTransaction,
  deleteTransaction,
  getTransactionsByUserId,
  getTransactionSummary
} from '../controllers/transactionController.js';

const router = express.Router();

// Create new transaction
router.post("/", createTransaction);

// Get transaction summary
router.get("/summary/:userId", getTransactionSummary);

// Get all transactions for a user
router.get("/:userId", getTransactionsByUserId);

// Delete a transaction
router.delete("/:id", deleteTransaction);

export default router;