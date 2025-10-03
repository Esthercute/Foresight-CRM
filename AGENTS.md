# Foresight-CRM System Architecture

## Overview
Foresight-CRM is a Customer Relationship Management (CRM) and retail data analytics system designed to provide real-time insights for businesses. The system combines a Flask backend API with a responsive frontend interface to deliver comprehensive customer data visualization and management capabilities.

## System Components

### 1. Backend API (Flask)
**File**: [`app.py`](app.py:1)

The backend serves as the core API engine with the following responsibilities:
- **Authentication**: Secure user login with SHA-256 password hashing
- **Database Connectivity**: PostgreSQL integration using psycopg2 with RealDictCursor
- **API Endpoints**:
  - [`/api/login`](app.py:54) - User authentication
  - [`/api/dashboard/revenue`](app.py:98) - Revenue data for dashboard visualization
  - [`/api/customer/<int:customer_id>`](app.py:134) - Customer details and transaction history

**Key Functions**:
- [`get_db_connection()`](app.py:28) - Establishes database connection with error handling
- [`hash_password()`](app.py:46) - SHA-256 password encryption

### 2. Frontend Interface

#### Login Page
**Files**: [`login.html`](login.html:1), [`script/login.js`](script/login.js:1), [`CSS/login.css`](CSS/login.css:1)

- User authentication interface
- Token-based session management
- Automatic redirect to dashboard on successful login
- Error handling for authentication failures

#### Dashboard
**Files**: [`dashboard.html`](dashboard.html:1), [`script/dashboard,js`](script/dashboard,js:1), [`CSS/dashboard.css`](CSS/dashboard.css:1)

- **Revenue Visualization**: Chart.js integration for monthly revenue trends
- **Date Filtering**: Interactive date range selection
- **Navigation**: Access to customer details and logout functionality
- **Authentication Check**: Token validation before rendering dashboard

#### Customer Detail Page
**Files**: [`detail.html`](detail.html:1), [`script/detail.js`](script/detail.js:1), [`CSS/detail.css`](CSS/detail.css:1)

- **Customer Information**: Display of customer details and purchase history
- **Transaction History**: Table view of all customer orders
- **Return Rate Prediction**: Visual indicator of customer return probability
- **Search Functionality**: Customer lookup by ID or phone number

### 3. Database Schema
**File**: [`database/schema.sql`](database/schema.sql:1)

The database structure includes:
- **orders table**: Stores transaction data with fields for ID, transaction date, customer ID, status, and total amount
- **customers table**: Customer information (referenced in API but schema needs completion)
- **users table**: User authentication credentials (referenced in API)

## Data Flow Architecture

```
Frontend (HTML/JS/CSS) 
    ↓ (HTTP Requests)
Flask API Backend
    ↓ (SQL Queries)
PostgreSQL Database
```

### Authentication Flow
1. User submits credentials via [`login.html`](login.html:1)
2. [`script/login.js`](script/login.js:1) sends POST request to [`/api/login`](app.py:54)
3. Backend validates credentials against database
4. Successful authentication returns JWT token
5. Token stored in localStorage for session management
6. Subsequent requests include Authorization header

### Dashboard Data Flow
1. [`script/dashboard,js`](script/dashboard,js:1) checks authentication token
2. Requests revenue data from [`/api/dashboard/revenue`](app.py:98)
3. Backend aggregates monthly revenue data
4. Chart.js renders visualization in [`dashboard.html`](dashboard.html:1)

### Customer Detail Flow
1. User searches customer by ID in [`detail.html`](detail.html:1)
2. [`script/detail.js`](script/detail.js:1) requests customer data from [`/api/customer/<id>`](app.py:134)
3. Backend retrieves customer details and transaction history
4. Frontend renders customer information and purchase history table

## Security Implementation
- **Password Hashing**: SHA-256 encryption for stored passwords
- **Token-Based Authentication**: Session management using localStorage
- **CORS Configuration**: Cross-origin resource sharing enabled
- **Input Validation**: Server-side validation for API inputs
- **Error Handling**: Comprehensive error responses without sensitive information exposure

## Technology Stack
- **Backend**: Python Flask with psycopg2 for PostgreSQL connectivity
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Database**: PostgreSQL with DBngin for local development
- **Visualization**: Chart.js for data representation
- **Styling**: Custom CSS with responsive design principles
- **Authentication**: Token-based session management

## Development Environment
- **Database Host**: 127.0.0.1 (DBngin)
- **API Server**: Flask running on localhost:5000
- **Frontend**: Static files served from filesystem
- **Environment Variables**: Loaded from .env file for database configuration

## Future Enhancement Opportunities
1. **Complete Database Schema**: Implement missing customers and users tables
2. **Real-time Updates**: WebSocket integration for live dashboard updates
3. **Advanced Analytics**: Machine learning for customer behavior prediction
4. **Mobile Responsiveness**: Enhanced mobile interface design
5. **Export Functionality**: PDF/CSV export for reports and data
6. **Role-Based Access**: Different permission levels for users