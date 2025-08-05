# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Currency

The system uses **Philippine Peso (PHP)** as the default currency. All monetary values in the API are in PHP (₱).

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "industry": "food-beverage|healthcare|retail|manufacturing|services",
  "businessName": "string"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "jwt-token",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "industry": "string",
    "businessName": "string",
    "role": "string"
  }
}
```

#### Login User
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt-token",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "industry": "string",
    "businessName": "string",
    "role": "string"
  }
}
```

#### Get Current User
```http
GET /auth/me
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "industry": "string",
    "businessName": "string",
    "role": "string"
  }
}
```

### Products

#### Get All Products
```http
GET /products
```

**Query Parameters:**
- `industry` (string) - Filter by industry
- `category` (string) - Filter by category
- `search` (string) - Search in name, description, or SKU

**Response:**
```json
[
  {
    "_id": "string",
    "name": "string",
    "description": "string",
    "category": "string",
    "price": "number",
    "cost": "number",
    "sku": "string",
    "barcode": "string",
    "stockQuantity": "number",
    "minStockLevel": "number",
    "unit": "string",
    "supplier": "string",
    "isActive": "boolean",
    "industry": "string",
    "createdAt": "date",
    "updatedAt": "date"
  }
]
```

#### Get Single Product
```http
GET /products/:id
```

**Response:**
```json
{
  "_id": "string",
  "name": "string",
  "description": "string",
  "category": "string",
  "price": "number",
  "cost": "number",
  "sku": "string",
  "barcode": "string",
  "stockQuantity": "number",
  "minStockLevel": "number",
  "unit": "string",
  "supplier": "string",
  "isActive": "boolean",
  "industry": "string",
  "createdAt": "date",
  "updatedAt": "date"
}
```

#### Create Product
```http
POST /products
```

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "category": "string",
  "price": "number",
  "cost": "number",
  "sku": "string",
  "barcode": "string",
  "stockQuantity": "number",
  "minStockLevel": "number",
  "unit": "string",
  "supplier": "string",
  "industry": "string"
}
```

#### Update Product
```http
PUT /products/:id
```

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "category": "string",
  "price": "number",
  "cost": "number"
}
```

#### Delete Product
```http
DELETE /products/:id
```

#### Update Stock Quantity
```http
PATCH /products/:id/stock
```

**Request Body:**
```json
{
  "quantity": "number"
}
```

#### Get Low Stock Products
```http
GET /products/low-stock/:industry
```

### Orders

#### Get All Orders
```http
GET /orders
```

**Query Parameters:**
- `industry` (string) - Filter by industry
- `status` (string) - Filter by status
- `date` (string) - Filter by date (YYYY-MM-DD)

**Response:**
```json
[
  {
    "_id": "string",
    "orderNumber": "string",
    "customer": {
      "name": "string",
      "email": "string",
      "phone": "string",
      "address": "string"
    },
    "items": [
      {
        "product": {
          "_id": "string",
          "name": "string",
          "price": "number",
          "sku": "string"
        },
        "quantity": "number",
        "price": "number",
        "total": "number"
      }
    ],
    "subtotal": "number",
    "tax": "number",
    "discount": "number",
    "total": "number",
    "status": "string",
    "paymentMethod": "string",
    "paymentStatus": "string",
    "notes": "string",
    "industry": "string",
    "orderType": "string",
    "assignedTo": {
      "_id": "string",
      "username": "string"
    },
    "createdAt": "date",
    "updatedAt": "date"
  }
]
```

#### Get Single Order
```http
GET /orders/:id
```

#### Create Order
```http
POST /orders
```

**Request Body:**
```json
{
  "customer": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "address": "string"
  },
  "items": [
    {
      "product": "string",
      "quantity": "number"
    }
  ],
  "tax": "number",
  "discount": "number",
  "notes": "string",
  "industry": "string",
  "orderType": "string",
  "assignedTo": "string"
}
```

#### Update Order Status
```http
PATCH /orders/:id/status
```

**Request Body:**
```json
{
  "status": "pending|confirmed|preparing|ready|delivered|cancelled"
}
```

#### Update Payment Status
```http
PATCH /orders/:id/payment
```

**Request Body:**
```json
{
  "paymentMethod": "cash|card|online",
  "paymentStatus": "paid|failed"
}
```

#### Get Order Queue
```http
GET /orders/queue/:industry
```

**Query Parameters:**
- `status` (string) - Filter by status

#### Get Order Statistics
```http
GET /orders/stats/:industry
```

**Query Parameters:**
- `startDate` (string) - Start date (YYYY-MM-DD)
- `endDate` (string) - End date (YYYY-MM-DD)

### Patients (Healthcare)

#### Get All Patients
```http
GET /patients
```

**Query Parameters:**
- `search` (string) - Search in name, ID, email, or phone
- `gender` (string) - Filter by gender
- `isActive` (boolean) - Filter by active status

**Response:**
```json
[
  {
    "_id": "string",
    "patientId": "string",
    "firstName": "string",
    "lastName": "string",
    "dateOfBirth": "date",
    "gender": "string",
    "email": "string",
    "phone": "string",
    "address": {
      "street": "string",
      "city": "string",
      "state": "string",
      "zipCode": "string",
      "country": "string"
    },
    "emergencyContact": {
      "name": "string",
      "relationship": "string",
      "phone": "string"
    },
    "medicalHistory": [
      {
        "condition": "string",
        "diagnosis": "string",
        "treatment": "string",
        "date": "date"
      }
    ],
    "allergies": ["string"],
    "medications": [
      {
        "name": "string",
        "dosage": "string",
        "frequency": "string",
        "startDate": "date",
        "endDate": "date"
      }
    ],
    "insurance": {
      "provider": "string",
      "policyNumber": "string",
      "groupNumber": "string"
    },
    "isActive": "boolean",
    "createdAt": "date",
    "updatedAt": "date"
  }
]
```

#### Get Single Patient
```http
GET /patients/:id
```

#### Create Patient
```http
POST /patients
```

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "dateOfBirth": "date",
  "gender": "male|female|other",
  "email": "string",
  "phone": "string",
  "address": {
    "street": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string",
    "country": "string"
  },
  "emergencyContact": {
    "name": "string",
    "relationship": "string",
    "phone": "string"
  },
  "allergies": ["string"],
  "insurance": {
    "provider": "string",
    "policyNumber": "string",
    "groupNumber": "string"
  }
}
```

#### Update Patient
```http
PUT /patients/:id
```

#### Delete Patient
```http
DELETE /patients/:id
```

#### Add Medical History
```http
POST /patients/:id/medical-history
```

**Request Body:**
```json
{
  "condition": "string",
  "diagnosis": "string",
  "treatment": "string",
  "date": "date"
}
```

#### Add Medication
```http
POST /patients/:id/medications
```

**Request Body:**
```json
{
  "name": "string",
  "dosage": "string",
  "frequency": "string",
  "startDate": "date"
}
```

#### Get Patient Statistics
```http
GET /patients/stats/overview
```

### Appointments (Healthcare)

#### Get All Appointments
```http
GET /appointments
```

**Query Parameters:**
- `date` (string) - Filter by date (YYYY-MM-DD)
- `status` (string) - Filter by status
- `doctor` (string) - Filter by doctor ID
- `patient` (string) - Filter by patient ID
- `type` (string) - Filter by appointment type

**Response:**
```json
[
  {
    "_id": "string",
    "appointmentId": "string",
    "patient": {
      "_id": "string",
      "firstName": "string",
      "lastName": "string",
      "patientId": "string",
      "phone": "string"
    },
    "doctor": {
      "_id": "string",
      "username": "string"
    },
    "date": "date",
    "time": "string",
    "duration": "number",
    "type": "string",
    "status": "string",
    "reason": "string",
    "notes": "string",
    "diagnosis": "string",
    "treatment": "string",
    "prescription": "string",
    "followUpDate": "date",
    "isUrgent": "boolean",
    "createdAt": "date",
    "updatedAt": "date"
  }
]
```

#### Get Single Appointment
```http
GET /appointments/:id
```

#### Create Appointment
```http
POST /appointments
```

**Request Body:**
```json
{
  "patient": "string",
  "doctor": "string",
  "date": "date",
  "time": "string",
  "duration": "number",
  "type": "consultation|follow-up|emergency|routine|specialist",
  "reason": "string",
  "notes": "string",
  "isUrgent": "boolean"
}
```

#### Update Appointment
```http
PUT /appointments/:id
```

#### Update Appointment Status
```http
PATCH /appointments/:id/status
```

**Request Body:**
```json
{
  "status": "scheduled|confirmed|in-progress|completed|cancelled|no-show",
  "diagnosis": "string",
  "treatment": "string",
  "prescription": "string",
  "followUpDate": "date"
}
```

#### Delete Appointment
```http
DELETE /appointments/:id
```

#### Get Appointments by Date Range
```http
GET /appointments/schedule/:startDate/:endDate
```

**Query Parameters:**
- `doctor` (string) - Filter by doctor ID

#### Get Appointment Statistics
```http
GET /appointments/stats/overview
```

**Query Parameters:**
- `startDate` (string) - Start date (YYYY-MM-DD)
- `endDate` (string) - End date (YYYY-MM-DD)

## Error Responses

### Validation Error
```json
{
  "errors": [
    {
      "msg": "string",
      "param": "string",
      "location": "string"
    }
  ]
}
```

### Server Error
```json
{
  "message": "Server error"
}
```

### Not Found Error
```json
{
  "message": "Resource not found"
}
```

### Authentication Error
```json
{
  "message": "Invalid credentials"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

Currently, there are no rate limits implemented. Future versions will include rate limiting for API endpoints.

## Pagination

Currently, pagination is not implemented. Future versions will include pagination for endpoints that return large datasets.

---

**Last Updated**: August 5, 2025
**Version**: 1.0.0 