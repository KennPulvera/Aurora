# AVA Business Management System

A modern, fullstack business management system built with the MERN stack (MongoDB, Express.js, React.js, Node.js) that adapts to different industries with industry-specific features.

## Features

### 🏭 Multi-Industry Support
- **Food & Beverage**: POS system, order queue, menu management, recipes
- **Healthcare**: Patient management, appointments, treatments, prescriptions
- **Retail**: Product catalog, inventory management, customer management
- **Manufacturing**: Product management, inventory, order tracking
- **Services**: Appointment scheduling, customer management

### 🔐 Authentication & Security
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (Admin, Manager, Employee)
- Industry-specific user registration

### 📊 Dashboard & Analytics
- Real-time statistics and metrics
- Industry-specific dashboards
- Sales reports and analytics
- Inventory tracking

### 🛠️ Core Features
- **User Management**: Registration, login, profile management
- **Inventory Management**: Stock tracking, low stock alerts
- **Order Management**: Order creation, status tracking, payment processing
- **Customer Management**: Customer profiles, history tracking
- **Reporting**: Sales reports, inventory reports, analytics

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation

### Frontend
- **React.js** with functional components and hooks
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Axios** for API calls
- **React Router** for navigation
- **React Hot Toast** for notifications

## Database Models

### User Model
- Username, email, password
- Industry selection
- Business name
- Role (admin, manager, employee)

### Product Model
- Name, description, category
- Price, cost, SKU
- Stock quantity, minimum stock level
- Industry-specific fields

### Order Model
- Customer information
- Order items with quantities
- Status tracking (pending, confirmed, preparing, ready, delivered)
- Payment information
- Industry-specific order types

### Patient Model (Healthcare)
- Personal information
- Medical history
- Allergies and medications
- Emergency contacts
- Insurance information

### Appointment Model (Healthcare)
- Patient and doctor references
- Date, time, duration
- Appointment type and status
- Notes and follow-up information

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB
- npm or yarn

### Backend Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb+srv://kennispulvera:kennkenn@cluster0.3lyyy37.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   PORT=5000
   ```

4. Start the backend server:
   ```bash
   npm run server
   ```

### Frontend Setup
1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm start
   ```

### Running Both Servers
From the root directory:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products (with industry filter)
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `PATCH /api/products/:id/stock` - Update stock quantity

### Orders
- `GET /api/orders` - Get all orders (with industry filter)
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id/status` - Update order status
- `PATCH /api/orders/:id/payment` - Update payment status
- `GET /api/orders/queue/:industry` - Get order queue for industry

### Patients (Healthcare)
- `GET /api/patients` - Get all patients
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient
- `POST /api/patients/:id/medical-history` - Add medical history
- `POST /api/patients/:id/medications` - Add medication

### Appointments (Healthcare)
- `GET /api/appointments` - Get all appointments
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/:id` - Update appointment
- `PATCH /api/appointments/:id/status` - Update appointment status
- `DELETE /api/appointments/:id` - Delete appointment

## Industry-Specific Features

### Food & Beverage
- **POS System**: Point of sale interface
- **Order Queue**: Real-time order tracking
- **Menu Management**: Menu items and categories
- **Recipes**: Recipe management and costing

### Healthcare
- **Patient Management**: Complete patient records
- **Appointment Scheduling**: Calendar-based scheduling
- **Medical History**: Patient medical records
- **Prescriptions**: Medication management

### Retail
- **Product Catalog**: Product management
- **Inventory Tracking**: Stock management
- **Customer Management**: Customer profiles
- **Order Processing**: Sales order management

### Manufacturing
- **Product Management**: Manufacturing products
- **Inventory Control**: Raw materials and finished goods
- **Order Tracking**: Production orders
- **Supplier Management**: Vendor relationships

### Services
- **Appointment Booking**: Service scheduling
- **Customer Database**: Client management
- **Service Tracking**: Service delivery tracking

## Usage

1. **Registration**: Create an account and select your industry
2. **Login**: Access your industry-specific dashboard
3. **Navigation**: Use the sidebar to access different modules
4. **Data Management**: Add, edit, and delete records as needed
5. **Reports**: View analytics and reports for your business

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the GitHub repository. 