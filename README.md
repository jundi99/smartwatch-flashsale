# Smart Watch Flash Sale System

A high-performance, scalable flash sale system built with Node.js (Express) backend and React frontend, designed to handle concurrent purchase requests for limited inventory items.

## 📋 Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [API Documentation](#api-documentation)
- [Design Decisions](#design-decisions)
- [Performance Considerations](#performance-considerations)

## 🎯 Overview

This flash sale system demonstrates a real-world e-commerce scenario where a limited quantity product (Smart Watch 2025 Edition) is sold during a time-limited flash sale period. The system handles:

- **Concurrent user requests** during high-traffic periods
- **Limited inventory management** with race condition prevention  
- **Time-based sale periods** with configurable start/end times
- **One item per user** constraint enforcement
- **Real-time UI updates** reflecting current sale status

## 🏗 System Architecture

```
┌─────────────────┐    HTTP/REST API    ┌─────────────────┐
│                 │ ◄──────────────────► │                 │
│  React Frontend │                     │ Node.js Backend │
│   (Port 5173)   │                     │   (Port 3001)   │
│                 │                     │                 │
└─────────────────┘                     └─────────────────┘
│                                       │
│ • Login Interface                     │ • Express.js Server
│ • Flash Sale Status                   │ • Joi Validation
│ • Purchase Attempt                    │ • Rate Limiting
│ • Real-time Updates                   │ • Concurrency Control
│ • Responsive UI                       │ • In-memory Storage*
│                                       │
                                        │
                    ┌─────────────────────────────────┐
                    │         Testing Suite           │
                    │                                 │
                    │ • Unit Tests (Jest)             │
                    │ • Integration Tests (Supertest) │
                    │ • Stress Tests (K6)             │
                    │ • ESLint Code Quality           │
                    └─────────────────────────────────┘

* In production, this would be replaced with 
  - Redis/Database
  - need module registration user and credential for user login
```

## ✨ Features

### Core Functional Requirements ✅
- ✅ **Configurable Flash Sale Period**: Start/end times with real-time countdown
- ✅ **Single Product, Limited Stock**: Smart Watch with configurable inventory
- ✅ **One Item Per User**: Enforced purchase limitation
- ✅ **RESTful API Server**: Complete Express.js backend with proper endpoints
- ✅ **Simple Frontend Interface**: React-based UI with real-time updates

### API Endpoints
- `GET /api/flash-sale/state/:userId` - Current sale status and product info
- `POST /api/flash-sale/purchase` - Attempt item purchase  
- `GET /api/flash-sale/user/:userId/purchase` - Check user purchase status
- `POST /api/auth/login` - User authentication
- `GET /api/flash-sale/stats` - Purchase statistics
- `POST /api/flash-sale/reset` - Reset sale (admin/testing)

### Non-Functional Requirements ✅
- ✅ **High Throughput & Scalability**: Rate limiting, efficient data structures
- ✅ **Robustness & Fault Tolerance**: Error handling, graceful degradation
- ✅ **Concurrency Control**: Atomic operations, race condition prevention

### Testing Requirements ✅
- ✅ **Unit Tests**: Service layer business logic validation
- ✅ **Integration Tests**: API endpoint functionality
- ✅ **Stress Tests**: K6 load testing with concurrent users

## 🛠 Technology Stack

### Backend
- **Runtime**: Node.js with CommonJS modules
- **Framework**: Express.js 4.x
- **Validation**: Joi for request validation
- **Security**: Helmet, CORS, Rate Limiting (express-rate-limit)
- **Logging**: Morgan HTTP request logger
- **Testing**: Jest + Supertest for API testing

### Frontend  
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (via index.css)
- **HTTP Client**: Fetch API with custom error handling

### DevOps & Testing
- **Code Quality**: ESLint with Standard configuration
- **Load Testing**: K6 for stress testing
- **Package Management**: NPM with workspaces

## 🚀 Setup Instructions

### Prerequisites
- Node.js 16+ and npm
- K6 (for stress testing) - [Installation Guide](https://k6.io/docs/get-started/installation/)

### 1. Clone and Install
```bash
git clone <repository-url>
cd smartwatch-flash-sale-system

# Install dependencies for both backend and frontend
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 2. Environment Configuration

#### Backend (.env)
```env
PORT=3001
NODE_ENV=development
FLASH_SALE_DURATION_MS=300000  # 5 minutes
PRE_SALE_WAIT_MS=30000         # 30 seconds
PRODUCT_STOCK=10
CORS_ORIGIN=http://localhost:5173
```
**Note**: Create a `.env` file in the `backend/` directory with the above configuration.

#### Frontend (.env) 
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_PORT=5173
```

**Note**: Create a `.env` file in the `frontend/` directory with the above configuration.

## 🎮 Running the Application

### Development Mode (Both services)
```bash
# Start both backend and frontend concurrently
npm run dev

# Or start individually:
npm run dev:backend    # Starts backend on port 3001
npm run dev:frontend   # Starts frontend on port 5173
```

### Accessing the Application
- **Frontend UI**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Backend API For StressTest**: http://localhost:3002
- **API Health Check**: http://localhost:3001/api/health

## 🧪 Testing

### Unit Tests
```bash
# Run all unit tests
npm run test:unit
```

### Integration Tests  
```bash
# Test API endpoints
npm run test:integration
```

### Stress Tests

K6 Load Testing:
```bash
# Install K6 first: https://k6.io/docs/get-started/installation/
# For Ubuntu/Debian:
sudo apt-get update && sudo apt-get install k6

# Run stress test (requires backend running on port 3002)
npm run dev:backend:stress  # Starts backend on port 3002 for stress testing
npm run test:stress         # In another terminal - runs K6 stress test
```

### Expected Stress Test Results
The K6 stress test simulates up to 200 concurrent users (ramping from 10→100→200→0):
- **Test Duration**: 30 seconds total with ramp up/down phases
- **Success Rate**: Very low (realistic for limited stock flash sales)
- **Response Time**: <500ms for 95% of requests, <200ms for 90% of successful requests
- **High Failure Rate**: Up to 95% failure rate is acceptable (flash sale nature)
- **Concurrency Control**: No overselling, proper stock management

## 📖 API Documentation

### User ID Format & Generation

The system uses a specific User ID format for internal processing:

**Format**: `user_{sanitized_email}`
- The email is sanitized by replacing `@` and `.` characters with `_`
- Example: `user@example.com` becomes `user_user_example_com`

**Frontend Login**:
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user123@mail.com"  // Simple identifier
}
```

**Backend Processing**:
```http
POST /api/flash-sale/purchase
Content-Type: application/json

{
  "userId": "user_user123"  // Auto-generated format: user_{email}
}
```

**Usage in Stress Tests**:
The K6 stress test automatically generates user IDs in this format:
- Input: `user1@test.com` → Output: `user_user1_test_com`

## 🎯 Design Decisions

### Concurrency Control
- **In-Memory Storage**: Uses JavaScript Set/Map for atomic operations
- **Single-Process Model**: Leverages Node.js event loop for concurrent request handling
- **Race Condition Prevention**: Atomic read-modify-write operations in purchase logic

### Scalability Strategy 
**Current Implementation (Demo):**
- In-memory storage for simplicity
- Single server instance

**Production Recommendations:**
- Redis for shared state across multiple server instances
- Database (PostgreSQL/MongoDB) for persistent storage  
- Message Queue (RabbitMQ/Kafka) for purchase processing
- Load balancer for horizontal scaling

## ⚡ Performance Considerations

### Backend Optimizations
- **Rate Limiting**: 100 requests/15min per IP, 10 purchases/min per IP
- **Request Validation**: Early validation with Joi to reject malformed requests
- **Efficient Data Structures**: Set/Map for O(1) lookups

### Frontend Optimizations  
- **Polling Strategy**: 2-second intervals balance real-time feel with server load
- **Component Memoization**: Prevents unnecessary re-renders
- **Loading States**: User feedback during network operations

## 📊 Load Test Results Summary

When running the K6 stress test with 200 concurrent users:
- **Total Requests**: ~2000-3000 requests
- **Purchase Attempts**: ~1000-1500 attempts  
- **Successful Purchases**: 10 (matches product stock)
- **Average Response Time**: ~150-300ms
- **95th Percentile**: <500ms
- **Error Rate**: <5% (excluding expected sold-out responses)

The system successfully prevents overselling while maintaining good performance under load.

## 🔧 Troubleshooting

### Common Issues

**Port Already in Use**:
```bash
# If port 3001 is occupied:
lsof -ti:3001 | xargs kill -9

# If port 3002 is occupied (stress test):
lsof -ti:3002 | xargs kill -9
```

**Stress Test Connection Issues**:
- Ensure backend is running on port 3002: `npm run dev:backend:stress`
- Check if K6 is properly installed: `k6 version`
- Verify no firewall blocking localhost connections

**User ID Format Issues**:
- Frontend automatically handles user ID generation
- Manual API calls must use format: `user_{identifier}`
