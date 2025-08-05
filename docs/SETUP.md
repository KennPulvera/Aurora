# Setup and Installation Guide

## Prerequisites

Before installing AVA Business Management System, ensure you have:

- **Node.js** (v14 or higher)
- **npm** or **yarn** package manager
- **MongoDB Atlas** account or local MongoDB instance
- **Git** (for cloning the repository)

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AVA
```

### 2. Install Backend Dependencies

```bash
npm install
```

### 3. Install Frontend Dependencies

```bash
cd client
npm install
cd ..
```

### 4. Environment Configuration

Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb+srv://kennispulvera:kennkenn@cluster0.3lyyy37.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
PORT=5000
```

### 5. Start the Application

#### Development Mode (Both Frontend and Backend)
```bash
npm run dev
```

#### Backend Only
```bash
npm run server
```

#### Frontend Only
```bash
cd client
npm start
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start production server |
| `npm run server` | Start development server with nodemon |
| `npm run client` | Start React development server |
| `npm run dev` | Start both frontend and backend in development |
| `npm run build` | Build React app for production |
| `npm run install-client` | Install frontend dependencies |

## Port Configuration

- **Backend**: `http://localhost:5000`
- **Frontend**: `http://localhost:3000`
- **MongoDB**: Atlas cluster (configured in .env)

## Database Setup

### MongoDB Atlas Configuration

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update the `MONGODB_URI` in your `.env` file

### Local MongoDB (Alternative)

If using local MongoDB:

```env
MONGODB_URI=mongodb://localhost:27017/ava-business
```

## First-Time Setup

### 1. Start the Application
```bash
npm run dev
```

### 2. Register Admin Account
1. Open `http://localhost:3000`
2. Click "Sign Up"
3. Fill in your details
4. Select your industry
5. Create your account

### 3. Verify Installation
- Check that you can log in
- Verify industry-specific features appear
- Test creating a record (product, patient, etc.)

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process on port 5000
npx kill-port 5000

# Kill process on port 3000
npx kill-port 3000
```

#### MongoDB Connection Issues
- Verify your connection string
- Check network connectivity
- Ensure MongoDB Atlas IP whitelist includes your IP

#### Node Modules Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### React Build Issues
```bash
cd client
rm -rf node_modules package-lock.json
npm install
```

### Environment Variables

Ensure all required environment variables are set:

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `NODE_ENV` | Environment (development/production) | No |
| `PORT` | Backend server port | No |

## Development Tools

### Recommended VS Code Extensions

- **ES7+ React/Redux/React-Native snippets**
- **Prettier - Code formatter**
- **ESLint**
- **MongoDB for VS Code**
- **Thunder Client** (for API testing)

### Useful Commands

```bash
# Check for security vulnerabilities
npm audit

# Fix security vulnerabilities
npm audit fix

# Update dependencies
npm update

# Check outdated packages
npm outdated
```

## Production Setup

For production deployment, see `DEPLOYMENT.md` for detailed instructions.

## Support

If you encounter issues during setup:

1. Check the troubleshooting section above
2. Review the `MAINTENANCE.md` file
3. Check the `CHANGELOG.md` for recent changes
4. Create an issue in the repository

---

**Last Updated**: August 5, 2025
**Version**: 1.0.0 