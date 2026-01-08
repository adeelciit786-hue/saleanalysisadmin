const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'sales.db');

let db;

function getDatabase() {
  if (!db) {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        console.log('Connected to SQLite database');
      }
    });
  }
  return db;
}

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        total REAL NOT NULL,
        sale_date TEXT NOT NULL,
        customer_name TEXT,
        region TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    db.run(createTableQuery, (err) => {
      if (err) {
        console.error('Error creating sales table:', err.message);
        reject(err);
      } else {
        console.log('Sales table initialized');
        // Insert sample data if table is empty
        db.get('SELECT COUNT(*) as count FROM sales', (err, row) => {
          if (err) {
            reject(err);
          } else if (row.count === 0) {
            insertSampleData(db);
            resolve();
          } else {
            resolve();
          }
        });
      }
    });
  });
}

function insertSampleData(db) {
  const sampleSales = [
    ['Laptop', 5, 1200, 6000, '2024-01-15', 'John Doe', 'North'],
    ['Mouse', 20, 25, 500, '2024-01-16', 'Jane Smith', 'South'],
    ['Keyboard', 15, 75, 1125, '2024-01-17', 'Bob Johnson', 'East'],
    ['Monitor', 8, 300, 2400, '2024-01-18', 'Alice Brown', 'West'],
    ['Headset', 12, 50, 600, '2024-01-19', 'Charlie Wilson', 'North'],
  ];
  
  const insertQuery = `
    INSERT INTO sales (product_name, quantity, price, total, sale_date, customer_name, region)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  const stmt = db.prepare(insertQuery);
  sampleSales.forEach(sale => {
    stmt.run(sale);
  });
  stmt.finalize();
  console.log('Sample sales data inserted');
}

module.exports = {
  getDatabase,
  initializeDatabase
};
