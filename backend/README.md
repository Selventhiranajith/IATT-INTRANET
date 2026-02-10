# Intranet Portal Backend API

Node.js backend with Express, MySQL, and JWT authentication for the Intranet Portal.

## Features

- ✅ User authentication (Login/Register)
- ✅ JWT token-based authorization
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (Admin, Manager, HR, Employee)
- ✅ MySQL database integration
- ✅ RESTful API endpoints
- ✅ CORS enabled
- ✅ Environment-based configuration

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## Installation

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update the database credentials and JWT secret
   ```bash
   cp .env.example .env
   ```

4. **Create database and tables:**
   - Open MySQL and run the queries from `database.sql`
   ```bash
   mysql -u root -p < database.sql
   ```

## Running the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/logout` | Logout user | Yes |
| POST | `/api/auth/change-password` | Change password | Yes |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |
| GET | `/` | API information |

## Request Examples

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "employee_id": "EMP003",
  "email": "user@example.com",
  "password": "Password123",
  "first_name": "John",
  "last_name": "Doe",
  "role": "employee",
  "department": "IT",
  "position": "Developer"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123"
}
```

### Get Current User (Protected)
```bash
GET /api/auth/me
Authorization: Bearer <your_jwt_token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (development only)"
}
```

## Database Schema

### Users Table
- `id` - Primary key
- `employee_id` - Unique employee identifier
- `email` - User email (unique)
- `password` - Hashed password
- `first_name` - First name
- `last_name` - Last name
- `role` - User role (admin, employee, manager, hr)
- `department` - Department name
- `position` - Job position
- `phone` - Contact number
- `status` - Account status (active, inactive, suspended)
- `last_login` - Last login timestamp
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

## Security Features

- Password hashing using bcrypt (10 salt rounds)
- JWT token authentication
- Role-based access control
- Token expiration (24 hours default)
- CORS protection
- Input validation

## Environment Variables

```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=intranet_portal
DB_PORT=3306
JWT_SECRET=your_secret_key
JWT_EXPIRE=24h
FRONTEND_URL=http://localhost:5173
```

## Project Structure

```
backend/
├── config/
│   ├── db.config.js          # Database connection
│   └── auth.config.js        # JWT configuration
├── controllers/
│   └── auth.controller.js    # Authentication logic
├── middleware/
│   └── auth.middleware.js    # JWT verification
├── models/
│   └── user.model.js         # User database operations
├── routes/
│   └── auth.routes.js        # API routes
├── utils/
│   └── helpers.js            # Utility functions
├── .env                      # Environment variables
├── server.js                 # Main server file
├── database.sql              # Database schema
└── package.json              # Dependencies
```

## Error Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## License

ISC
