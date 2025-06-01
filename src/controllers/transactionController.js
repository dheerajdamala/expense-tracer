import {sql} from '../config/db.js';

export async function getTransactionsByUserId(req, res) {
  try {
    const { userId } = req.params;
    console.log('Fetching transactions for user:', userId);
    const transactions = await sql`
      SELECT * FROM transactions WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
    // Always return an array, even if empty
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error getting transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createTransaction(req, res) {
  try {
    const { user_id, amount, title, category } = req.body;
    if (!user_id || amount === undefined || !title || !category) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const transaction = await sql`
      INSERT INTO transactions (user_id, amount, title, category)
      VALUES (${user_id}, ${amount}, ${title}, ${category})
      RETURNING *
    `;
    console.log('Transaction created:', transaction);
    res.status(201).json(transaction[0]);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteTransaction(req, res) {
  try {
    const { id } = req.params;
    if (isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid transaction ID' });
    }
    const result = await sql`
      DELETE FROM transactions WHERE id = ${id}
      RETURNING *
    `;
    if (result.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.status(200).json({ message: 'Transaction deleted successfully', transaction: result[0] });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getTransactionSummary(req, res) {
  try {
    const { userId } = req.params;
    console.log('Fetching summary for user:', userId);
    const balanceresult = await sql`
      SELECT COALESCE(SUM(amount),0) as balance FROM transactions WHERE user_id = ${userId}
    `;
    const incomeresult = await sql`
      SELECT COALESCE(SUM(amount),0) as income FROM transactions WHERE user_id = ${userId} AND amount > 0
    `;
    const expensesresult = await sql`
      SELECT COALESCE(SUM(amount),0) as expenses FROM transactions WHERE user_id = ${userId} AND amount < 0
    `;
    res.status(200).json({
      balance: balanceresult[0].balance,
      income: incomeresult[0].income,
      expenses: expensesresult[0].expenses
    });
  } catch (error) {
    console.error('Error getting transaction summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 