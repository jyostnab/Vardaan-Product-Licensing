
# Vardaan Product Licensing System

A comprehensive licensing system with support for various licensing models.

## Backend Setup (Node.js + MySQL)

### Prerequisites
- Node.js 14+ and npm
- MySQL 5.7+ or 8.0+

### MySQL Setup
1. Install MySQL server if you don't have it already
2. Create a new database:
```sql
CREATE DATABASE vardaan_licensing;
```
3. Configure the database connection in `server/.env` (copy from `.env.example`)

### Server Setup
1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example` and configure your database connection:
```bash
cp .env.example .env
```

4. Start the server:
```bash
npm start
```

The API server will run on http://localhost:8080 by default.

## Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The frontend will run on http://localhost:5173 by default.

## Features
- Multiple license types support: Date-based, User-based, MAC-based, Country-based, and Mixed
- Product version management
- Customer management
- License verification
- Authentication system
- Verification logs

## License Types
- **Date-based**: Licensed until a specific expiry date
- **User-based**: Limited by the number of users
- **MAC-based**: Restricted to specific device MAC addresses
- **Country-based**: Restricted to specific countries
- **Mixed**: Combination of multiple restriction types
