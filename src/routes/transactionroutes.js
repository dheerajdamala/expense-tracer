import express from 'express';
import {createTransaction,deleteTransaction, getTransactionsByUserId, getTransactionSummary} from '../controllers/transactionController.js';

const router = express.Router();

router.delete("/:id",deleteTransaction);

router.get("/:userId", getTransactionsByUserId);

router.post("/",createTransaction);

router.get("/summary/:userId",getTransactionSummary);


export default router;