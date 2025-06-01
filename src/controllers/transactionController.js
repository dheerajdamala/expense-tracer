import {sql} from '../config/db.js';

export async function getTransactionsByUserId(req, res) {
  try {
    const { userId } = req.params;
    console.log('Fetching transactions for user:', userId);
    console.log('Request params:', req.params);
    console.log('Request query:', req.query);
    
    if (!userId) {
      console.error('No userId provided');
      return res.status(400).json({ error: 'User ID is required' });
    }

    console.log('Executing SQL query for transactions...');
    const query = sql`
      SELECT * FROM transactions WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
    console.log('SQL query:', query.toString());
    
    const transactions = await query;
    console.log(`Found ${transactions.length} transactions for user ${userId}`);
    
    // Always return an array, even if empty
    res.status(200).json(transactions || []);
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function createTransaction(req, res) {
  try {
    const { user_id, amount, title, category } = req.body;
    console.log('Creating transaction:', { user_id, amount, title, category });
    console.log('Request body:', req.body);
    
    if (!user_id || amount === undefined || !title || !category) {
      console.error('Missing required fields:', { user_id, amount, title, category });
      return res.status(400).json({ error: 'All fields are required' });
    }

    console.log('Executing SQL query to create transaction...');
    const query = sql`
      INSERT INTO transactions (user_id, amount, title, category)
      VALUES (${user_id}, ${amount}, ${title}, ${category})
      RETURNING *
    `;
    console.log('SQL query:', query.toString());
    
    const transaction = await query;
    console.log('Transaction created:', transaction[0]);
    res.status(201).json(transaction[0]);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function deleteTransaction(req, res) {
  try {
    const { id } = req.params;
    console.log('Attempting to delete transaction:', id);
    console.log('Request params:', req.params);
    
    if (!id || isNaN(parseInt(id))) {
      console.error('Invalid transaction ID:', id);
      return res.status(400).json({ error: 'Invalid transaction ID' });
    }

    console.log('Executing SQL query to delete transaction...');
    const query = sql`
      DELETE FROM transactions WHERE id = ${id}
      RETURNING *
    `;
    console.log('SQL query:', query.toString());
    
    const result = await query;
    
    if (result.length === 0) {
      console.log('No transaction found with ID:', id);
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    console.log('Transaction deleted successfully:', result[0]);
    res.status(200).json({ message: 'Transaction deleted successfully', transaction: result[0] });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export async function getTransactionSummary(req, res) {
  try {
    const { userId } = req.params;
    console.log('Fetching summary for user:', userId);
    console.log('Request params:', req.params);
    
    if (!userId) {
      console.error('No userId provided');
      return res.status(400).json({ error: 'User ID is required' });
    }

    console.log('Executing SQL queries for summary...');
    const balanceQuery = sql`
      SELECT COALESCE(SUM(amount),0) as balance FROM transactions WHERE user_id = ${userId}
    `;
    const incomeQuery = sql`
      SELECT COALESCE(SUM(amount),0) as income FROM transactions WHERE user_id = ${userId} AND amount > 0
    `;
    const expensesQuery = sql`
      SELECT COALESCE(SUM(amount),0) as expenses FROM transactions WHERE user_id = ${userId} AND amount < 0
    `;
    
    console.log('SQL queries:', {
      balance: balanceQuery.toString(),
      income: incomeQuery.toString(),
      expenses: expensesQuery.toString()
    });
    
    const [balanceresult, incomeresult, expensesresult] = await Promise.all([
      balanceQuery,
      incomeQuery,
      expensesQuery
    ]);
    
    const summary = {
      balance: balanceresult[0].balance,
      income: incomeresult[0].income,
      expenses: expensesresult[0].expenses
    };
    
    console.log('Summary calculated:', summary);
    res.status(200).json(summary);
  } catch (error) {
    console.error('Error getting transaction summary:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
} 