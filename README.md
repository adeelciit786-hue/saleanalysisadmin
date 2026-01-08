# Sales Analysis Admin

A comprehensive web application for managing and analyzing sales data. This application provides an admin dashboard to track sales, visualize statistics, and manage sales records with full CRUD operations.

## Features

- 📊 **Sales Dashboard**: Real-time statistics and analytics
- 📈 **Sales Analytics**: View total sales, quantities, averages, and trends
- 🌍 **Regional Analysis**: Track sales performance by region
- 🏆 **Top Products**: Identify best-selling products
- ✏️ **CRUD Operations**: Create, read, update, and delete sales records
- 💾 **SQLite Database**: Lightweight, file-based database for data persistence
- 🎨 **Modern UI**: Responsive design with gradient styling

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/adeelciit786-hue/saleanalysisadmin.git
cd saleanalysisadmin
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional, defaults provided):
```bash
cp .env.example .env
```

## Usage

1. Start the server:
```bash
npm start
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

3. The application will automatically create a SQLite database with sample data on first run.

## API Endpoints

### Sales Endpoints

- `GET /api/sales` - Get all sales
- `GET /api/sales/:id` - Get a specific sale
- `GET /api/sales/stats` - Get sales statistics
- `POST /api/sales` - Create a new sale
- `PUT /api/sales/:id` - Update a sale
- `DELETE /api/sales/:id` - Delete a sale

### Example API Request

Create a new sale:
```bash
curl -X POST http://localhost:3000/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "Laptop",
    "quantity": 5,
    "price": 1200,
    "sale_date": "2024-01-15",
    "customer_name": "John Doe",
    "region": "North"
  }'
```

## Project Structure

```
saleanalysisadmin/
├── database/
│   └── db.js              # Database initialization and connection
├── routes/
│   └── sales.js           # Sales API routes
├── public/
│   ├── index.html         # Main HTML page
│   ├── styles.css         # CSS styling
│   └── app.js             # Frontend JavaScript
├── server.js              # Express server setup
├── package.json           # Node.js dependencies
├── .env.example           # Environment variables template
├── .gitignore            # Git ignore file
└── README.md             # This file
```

## Database Schema

The application uses SQLite with the following schema:

```sql
CREATE TABLE sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price REAL NOT NULL,
  total REAL NOT NULL,
  sale_date TEXT NOT NULL,
  customer_name TEXT,
  region TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Configuration

Environment variables (optional):
- `PORT` - Server port (default: 3000)
- `DB_PATH` - SQLite database path (default: ./sales.db)

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Other**: CORS, body-parser, dotenv

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

ISC

## Author

adeelciit786-hue
