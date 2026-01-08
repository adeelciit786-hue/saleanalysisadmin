const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/db');

// GET all sales
router.get('/', (req, res) => {
  const db = getDatabase();
  const query = 'SELECT * FROM sales ORDER BY sale_date DESC';
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ sales: rows });
  });
});

// GET sales statistics
router.get('/stats', (req, res) => {
  const db = getDatabase();
  
  const queries = {
    totalSales: 'SELECT SUM(total) as total FROM sales',
    totalQuantity: 'SELECT SUM(quantity) as quantity FROM sales',
    salesCount: 'SELECT COUNT(*) as count FROM sales',
    avgSale: 'SELECT AVG(total) as average FROM sales',
    byRegion: 'SELECT region, SUM(total) as total FROM sales GROUP BY region',
    topProducts: 'SELECT product_name, SUM(quantity) as quantity, SUM(total) as revenue FROM sales GROUP BY product_name ORDER BY revenue DESC LIMIT 5'
  };
  
  const stats = {};
  let completed = 0;
  let hasError = false;
  const totalQueries = Object.keys(queries).length;
  
  Object.entries(queries).forEach(([key, query]) => {
    db.all(query, [], (err, rows) => {
      if (hasError) return; // Skip if we already encountered an error
      
      if (err) {
        hasError = true;
        res.status(500).json({ error: 'Failed to fetch statistics', details: err.message });
        return;
      }
      
      stats[key] = rows;
      completed++;
      if (completed === totalQueries) {
        res.json(stats);
      }
    });
  });
});

// GET single sale by ID
router.get('/:id', (req, res) => {
  const db = getDatabase();
  const query = 'SELECT * FROM sales WHERE id = ?';
  
  db.get(query, [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Sale not found' });
      return;
    }
    res.json(row);
  });
});

// POST create new sale
router.post('/', (req, res) => {
  const { product_name, quantity, price, sale_date, customer_name, region } = req.body;
  
  if (!product_name || !quantity || !price || !sale_date) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }
  
  const total = quantity * price;
  const db = getDatabase();
  const query = `
    INSERT INTO sales (product_name, quantity, price, total, sale_date, customer_name, region)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(query, [product_name, quantity, price, total, sale_date, customer_name, region], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: this.lastID, message: 'Sale created successfully' });
  });
});

// PUT update sale
router.put('/:id', (req, res) => {
  const { product_name, quantity, price, sale_date, customer_name, region } = req.body;
  
  if (!product_name || !quantity || !price || !sale_date) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }
  
  const total = quantity * price;
  const db = getDatabase();
  const query = `
    UPDATE sales
    SET product_name = ?, quantity = ?, price = ?, total = ?, sale_date = ?, customer_name = ?, region = ?
    WHERE id = ?
  `;
  
  db.run(query, [product_name, quantity, price, total, sale_date, customer_name, region, req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Sale not found' });
      return;
    }
    res.json({ message: 'Sale updated successfully' });
  });
});

// DELETE sale
router.delete('/:id', (req, res) => {
  const db = getDatabase();
  const query = 'DELETE FROM sales WHERE id = ?';
  
  db.run(query, [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Sale not found' });
      return;
    }
    res.json({ message: 'Sale deleted successfully' });
  });
});

module.exports = router;
