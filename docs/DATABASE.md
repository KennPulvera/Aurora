# Database Documentation

## Overview

AVA Business Management System uses **MongoDB** as the primary database with **Mongoose** as the ODM (Object Document Mapper). The database is designed to support multiple industries with industry-specific data models.

## Database Connection

### Connection String
```
mongodb+srv://kennispulvera:kennkenn@cluster0.3lyyy37.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

### Connection Configuration
```javascript
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
```

## Database Models

### 1. User Model

**File**: `models/User.js`

**Purpose**: Manages user authentication and business information

**Schema**:
```javascript
{
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  industry: {
    type: String,
    enum: ['food-beverage', 'healthcare', 'retail', 'manufacturing', 'services'],
    required: true
  },
  businessName: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'employee'],
    default: 'employee'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  timestamps: true
}
```

**Indexes**:
- `username` (unique)
- `email` (unique)

**Methods**:
- `comparePassword(candidatePassword)` - Compares password with hashed version

**Pre-save Hooks**:
- Password hashing using bcrypt

**Sample Document**:
```json
{
  "_id": "ObjectId",
  "username": "admin",
  "email": "admin@business.com",
  "password": "$2a$10$hashedpassword",
  "industry": "healthcare",
  "businessName": "City Medical Center",
  "role": "admin",
  "isActive": true,
  "createdAt": "2025-08-05T14:30:00.000Z",
  "updatedAt": "2025-08-05T14:30:00.000Z"
}
```

### 2. Product Model

**File**: `models/Product.js`

**Purpose**: Manages products for retail and manufacturing industries

**Schema**:
```javascript
{
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  sku: {
    type: String,
    unique: true,
    trim: true
  },
  barcode: {
    type: String,
    trim: true
  },
  stockQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  minStockLevel: {
    type: Number,
    default: 10,
    min: 0
  },
  unit: {
    type: String,
    default: 'piece'
  },
  supplier: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  industry: {
    type: String,
    enum: ['food-beverage', 'healthcare', 'retail', 'manufacturing', 'services'],
    required: true
  },
  timestamps: true
}
```

**Indexes**:
- `sku` (unique)
- `industry`
- `category`
- `isActive`

**Sample Document**:
```json
{
  "_id": "ObjectId",
  "name": "Premium Coffee Beans",
  "description": "High-quality Arabica coffee beans",
  "category": "Beverages",
  "price": 25.99,
  "cost": 15.50,
  "sku": "COFFEE-001",
  "barcode": "1234567890123",
  "stockQuantity": 50,
  "minStockLevel": 10,
  "unit": "kg",
  "supplier": "Coffee Supplier Co.",
  "isActive": true,
  "industry": "food-beverage",
  "createdAt": "2025-08-05T14:30:00.000Z",
  "updatedAt": "2025-08-05T14:30:00.000Z"
}
```

### 3. Order Model

**File**: `models/Order.js`

**Purpose**: Manages orders for food & beverage, retail, and manufacturing industries

**Sub-schema - OrderItem**:
```javascript
{
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  }
}
```

**Main Schema**:
```javascript
{
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    name: String,
    email: String,
    phone: String,
    address: String
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'online', 'pending'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  notes: String,
  industry: {
    type: String,
    enum: ['food-beverage', 'healthcare', 'retail', 'manufacturing', 'services'],
    required: true
  },
  orderType: {
    type: String,
    enum: ['dine-in', 'takeaway', 'delivery', 'online', 'walk-in'],
    default: 'walk-in'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  timestamps: true
}
```

**Indexes**:
- `orderNumber` (unique)
- `industry`
- `status`
- `createdAt`
- `assignedTo`

**Pre-save Hooks**:
- Auto-generate order number

**Sample Document**:
```json
{
  "_id": "ObjectId",
  "orderNumber": "ORD-1733409000000-1",
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": "123 Main St, City, State"
  },
  "items": [
    {
      "product": "ObjectId",
      "quantity": 2,
      "price": 25.99,
      "total": 51.98
    }
  ],
  "subtotal": 51.98,
  "tax": 4.16,
  "discount": 0,
  "total": 56.14,
  "status": "pending",
  "paymentMethod": "card",
  "paymentStatus": "paid",
  "notes": "Extra hot coffee",
  "industry": "food-beverage",
  "orderType": "takeaway",
  "assignedTo": "ObjectId",
  "createdAt": "2025-08-05T14:30:00.000Z",
  "updatedAt": "2025-08-05T14:30:00.000Z"
}
```

### 4. Patient Model

**File**: `models/Patient.js`

**Purpose**: Manages patient information for healthcare industry

**Schema**:
```javascript
{
  patientId: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  medicalHistory: [{
    condition: String,
    diagnosis: String,
    treatment: String,
    date: Date
  }],
  allergies: [String],
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date
  }],
  insurance: {
    provider: String,
    policyNumber: String,
    groupNumber: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  timestamps: true
}
```

**Indexes**:
- `patientId` (unique)
- `firstName`, `lastName`
- `email`
- `phone`
- `isActive`

**Pre-save Hooks**:
- Auto-generate patient ID

**Sample Document**:
```json
{
  "_id": "ObjectId",
  "patientId": "PAT-1733409000000-1",
  "firstName": "Jane",
  "lastName": "Smith",
  "dateOfBirth": "1990-05-15T00:00:00.000Z",
  "gender": "female",
  "email": "jane.smith@email.com",
  "phone": "+1234567890",
  "address": {
    "street": "456 Oak Ave",
    "city": "Springfield",
    "state": "IL",
    "zipCode": "62701",
    "country": "USA"
  },
  "emergencyContact": {
    "name": "John Smith",
    "relationship": "Spouse",
    "phone": "+1234567891"
  },
  "medicalHistory": [
    {
      "condition": "Hypertension",
      "diagnosis": "Essential hypertension",
      "treatment": "Lisinopril 10mg daily",
      "date": "2024-01-15T00:00:00.000Z"
    }
  ],
  "allergies": ["Penicillin", "Sulfa drugs"],
  "medications": [
    {
      "name": "Lisinopril",
      "dosage": "10mg",
      "frequency": "Once daily",
      "startDate": "2024-01-15T00:00:00.000Z",
      "endDate": null
    }
  ],
  "insurance": {
    "provider": "Blue Cross Blue Shield",
    "policyNumber": "BCBS123456",
    "groupNumber": "GRP789"
  },
  "isActive": true,
  "createdAt": "2025-08-05T14:30:00.000Z",
  "updatedAt": "2025-08-05T14:30:00.000Z"
}
```

### 5. Appointment Model

**File**: `models/Appointment.js`

**Purpose**: Manages appointments for healthcare and services industries

**Schema**:
```javascript
{
  appointmentId: {
    type: String,
    required: true,
    unique: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 30,
    min: 15,
    max: 180
  },
  type: {
    type: String,
    enum: ['consultation', 'follow-up', 'emergency', 'routine', 'specialist'],
    default: 'consultation'
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  reason: {
    type: String,
    required: true
  },
  notes: String,
  diagnosis: String,
  treatment: String,
  prescription: String,
  followUpDate: Date,
  isUrgent: {
    type: Boolean,
    default: false
  },
  timestamps: true
}
```

**Indexes**:
- `appointmentId` (unique)
- `patient`
- `doctor`
- `date`
- `status`
- `isUrgent`

**Pre-save Hooks**:
- Auto-generate appointment ID

**Sample Document**:
```json
{
  "_id": "ObjectId",
  "appointmentId": "APT-1733409000000-1",
  "patient": "ObjectId",
  "doctor": "ObjectId",
  "date": "2025-08-10T00:00:00.000Z",
  "time": "14:30",
  "duration": 30,
  "type": "consultation",
  "status": "scheduled",
  "reason": "Annual checkup",
  "notes": "Patient prefers morning appointments",
  "diagnosis": null,
  "treatment": null,
  "prescription": null,
  "followUpDate": null,
  "isUrgent": false,
  "createdAt": "2025-08-05T14:30:00.000Z",
  "updatedAt": "2025-08-05T14:30:00.000Z"
}
```

## Database Relationships

### One-to-Many Relationships
- **User** → **Orders** (assignedTo)
- **User** → **Appointments** (doctor)
- **Patient** → **Appointments** (patient)
- **Product** → **Order Items** (product)

### Industry-Specific Collections
Each industry uses specific collections:
- **Food & Beverage**: Products, Orders
- **Healthcare**: Patients, Appointments
- **Retail**: Products, Orders
- **Manufacturing**: Products, Orders
- **Services**: Appointments

## Database Operations

### Common Queries

#### Find Products by Industry
```javascript
const products = await Product.find({ 
  industry: 'food-beverage', 
  isActive: true 
});
```

#### Find Orders with Status
```javascript
const orders = await Order.find({ 
  status: 'pending',
  industry: 'food-beverage' 
}).populate('items.product');
```

#### Find Patients with Search
```javascript
const patients = await Patient.find({
  $or: [
    { firstName: { $regex: search, $options: 'i' } },
    { lastName: { $regex: search, $options: 'i' } },
    { patientId: { $regex: search, $options: 'i' } }
  ],
  isActive: true
});
```

#### Find Appointments by Date Range
```javascript
const appointments = await Appointment.find({
  date: {
    $gte: startDate,
    $lte: endDate
  },
  status: { $in: ['scheduled', 'confirmed'] }
}).populate('patient doctor');
```

### Aggregation Examples

#### Order Statistics
```javascript
const stats = await Order.aggregate([
  { $match: { industry: 'food-beverage' } },
  { $group: {
    _id: '$status',
    count: { $sum: 1 },
    totalAmount: { $sum: '$total' }
  }}
]);
```

#### Patient Demographics
```javascript
const demographics = await Patient.aggregate([
  { $match: { isActive: true } },
  { $group: {
    _id: '$gender',
    count: { $sum: 1 },
    avgAge: { $avg: { $subtract: [new Date(), '$dateOfBirth'] } }
  }}
]);
```

## Data Validation

### Mongoose Validation
- Required fields validation
- Enum validation for status fields
- Min/max value validation
- Email format validation
- Unique constraint validation

### Custom Validation
- Password strength validation
- Phone number format validation
- Date range validation
- Business logic validation

## Backup and Recovery

### Backup Strategy
1. **MongoDB Atlas** provides automatic backups
2. **Manual exports** for data migration
3. **Point-in-time recovery** available

### Data Export
```bash
# Export specific collection
mongoexport --uri="connection_string" --collection=users --out=users.json

# Export entire database
mongodump --uri="connection_string" --out=backup/
```

## Performance Optimization

### Indexes
- **Compound indexes** for common query patterns
- **Text indexes** for search functionality
- **TTL indexes** for temporary data

### Query Optimization
- **Projection** to limit returned fields
- **Pagination** for large datasets
- **Aggregation pipelines** for complex queries

## Security Considerations

### Data Protection
- **Password hashing** with bcrypt
- **JWT tokens** for authentication
- **Input validation** and sanitization
- **NoSQL injection** prevention

### Access Control
- **Role-based access** control
- **Industry-specific** data isolation
- **API authentication** required

---

**Last Updated**: August 5, 2025
**Version**: 1.0.0 