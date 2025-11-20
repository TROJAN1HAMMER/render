# Field Executive APIs Documentation

This document provides comprehensive documentation for all Field Executive APIs implemented in the backend system, including the new sales executive functionality.

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
   - [GPS Location Tracking](#gps-location-tracking)
   - [Tasks Management](#tasks-management)
   - [Chat System](#chat-system)
   - [Camera Operations](#camera-operations)
   - [Customer Management](#customer-management)
   - [Order Management](#order-management)
   - [Other Operations](#other-operations)
4. [Database Schema](#database-schema)
5. [Error Handling](#error-handling)
6. [Testing](#testing)

## Overview

The Field Executive APIs are designed to support field executives in their daily operations including:
- GPS location tracking
- Task management
- Customer visit reporting
- Order placement and management
- Communication via chat
- Image capture and signature collection
- Offline data synchronization

## Authentication

All APIs require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### GPS Location Tracking

#### Submit Location
- **POST** `/fieldExecutive/location`
- **Description**: Record GPS coordinates for the sales executive
- **Request Body**:
  ```json
  {
    "latitude": 28.6139,
    "longitude": 77.2090
  }
  ```
- **Response**: Location recorded successfully

#### Get Location History
- **GET** `/fieldExecutive/location`
- **Description**: Retrieve location history for the sales executive
- **Response**: Array of location records

### Tasks Management

#### Get Tasks
- **GET** `/fieldExecutive/task`
- **Description**: Get all tasks assigned to the sales executive
- **Query Parameters**:
  - `status` (optional): Filter by task status (Pending, InProgress, Completed)
- **Response**: Array of tasks with descriptions

#### Get Task Details
- **GET** `/fieldExecutive/task/{id}`
- **Description**: Get detailed information about a specific task
- **Response**: Task object with full description

#### Update Task Status
- **PATCH** `/fieldExecutive/task/{id}/status`
- **Description**: Update the status of a task
- **Request Body**:
  ```json
  {
    "status": "InProgress"
  }
  ```

### Chat System

#### Get Messages
- **GET** `/fieldExecutive/chat/messages`
- **Description**: Retrieve chat messages
- **Query Parameters**:
  - `receiverId` (optional): Filter messages with specific receiver
- **Response**: Array of chat messages

#### Send Message
- **POST** `/fieldExecutive/chat/send`
- **Description**: Send a chat message
- **Request Body**:
  ```json
  {
    "content": "Hello, I need assistance with a customer visit",
    "receiverId": "optional-receiver-id"
  }
  ```

### Camera Operations

#### Upload Image
- **POST** `/fieldExecutive/camera/upload`
- **Description**: Upload captured image with GPS coordinates
- **Content-Type**: `multipart/form-data`
- **Form Data**:
  - `image`: Image file (required)
  - `latitude`: Latitude coordinate (required)
  - `longitude`: Longitude coordinate (required)
  - `description`: Optional description

#### Get My Images
- **GET** `/fieldExecutive/camera/images`
- **Description**: Retrieve all captured images
- **Response**: Array of image metadata

### Customer Management

#### Get Assigned Customers
- **GET** `/fieldExecutive/customers`
- **Description**: Get list of customers assigned to the sales executive
- **Response**: Array of customer objects with contact information

#### Get Customer Details
- **GET** `/fieldExecutive/customers/{id}`
- **Description**: Get detailed customer information with visit history
- **Response**: Customer object with visit records

#### Create Visit Report
- **POST** `/fieldExecutive/customers/{id}/visits`
- **Description**: Create a customer visit report
- **Request Body**:
  ```json
  {
    "visitDate": "2024-01-15T10:00:00Z",
    "location": "Customer Office",
    "peoplePresent": "John Doe, Jane Smith",
    "productsDiscussed": "Product A, Product B",
    "reasonForVisit": "Follow-up on previous order",
    "customerConcerns": "Delivery timeline concerns",
    "investigationStatus": "Under Review",
    "rootCause": "Logistics delay",
    "correctiveAction": "Expedited shipping arranged",
    "recommendations": "Implement better tracking system",
    "feedback": "Customer satisfied with resolution"
  }
  ```

#### Get Visit Reports
- **GET** `/fieldExecutive/customers/visits`
- **Description**: Get all visit reports
- **Query Parameters**:
  - `customerId` (optional): Filter by customer ID
- **Response**: Array of visit reports

### Order Management

#### Get Products
- **GET** `/fieldExecutive/orders/products`
- **Description**: Get all available products
- **Query Parameters**:
  - `categoryId` (optional): Filter by category
  - `search` (optional): Search by product name
- **Response**: Array of products with details

#### Get Product Details
- **GET** `/fieldExecutive/orders/products/{id}`
- **Description**: Get detailed product information
- **Response**: Product object with full details

#### Check Stock
- **GET** `/fieldExecutive/orders/products/{id}/stock`
- **Description**: Check product stock availability
- **Response**: Stock information

#### Cart Operations

##### Get Cart
- **GET** `/fieldExecutive/orders/cart`
- **Description**: Get current cart contents
- **Response**: Cart object with items and total

##### Add to Cart
- **POST** `/fieldExecutive/orders/cart`
- **Description**: Add product to cart
- **Request Body**:
  ```json
  {
    "productId": "product-id",
    "quantity": 2
  }
  ```

##### Remove from Cart
- **DELETE** `/fieldExecutive/orders/cart/{itemId}`
- **Description**: Remove item from cart

##### Clear Cart
- **DELETE** `/fieldExecutive/orders/cart`
- **Description**: Clear all items from cart

#### Order Operations

##### Place Order
- **POST** `/fieldExecutive/orders`
- **Description**: Place an order
- **Request Body**:
  ```json
  {
    "items": [
      {
        "productId": "product-id",
        "quantity": 2
      }
    ],
    "promoCode": "optional-promo-code"
  }
  ```

##### Get My Orders
- **GET** `/fieldExecutive/orders`
- **Description**: Get order history
- **Response**: Array of orders with details

### Other Operations

#### Capture Signature
- **POST** `/fieldExecutive/operations/signature`
- **Description**: Capture digital signature
- **Request Body**:
  ```json
  {
    "signatureData": "base64-encoded-signature",
    "context": "Order Confirmation"
  }
  ```

#### Sync Offline Data
- **POST** `/fieldExecutive/operations/sync`
- **Description**: Synchronize offline data
- **Request Body**:
  ```json
  {
    "offlineData": [
      {
        "dataType": "order",
        "data": { /* order data */ }
      }
    ]
  }
  ```

#### Get Offline Data
- **GET** `/fieldExecutive/operations/sync`
- **Description**: Get offline data records
- **Query Parameters**:
  - `synced` (optional): Filter by sync status

#### Notifications

##### Get Notifications
- **GET** `/fieldExecutive/operations/notifications`
- **Description**: Get user notifications
- **Query Parameters**:
  - `unreadOnly` (optional): Filter unread notifications only

##### Mark Notification as Read
- **PATCH** `/fieldExecutive/operations/notifications/{id}/read`
- **Description**: Mark specific notification as read

##### Mark All Notifications as Read
- **PATCH** `/fieldExecutive/operations/notifications/read-all`
- **Description**: Mark all notifications as read

## Database Schema

### New Models Added

#### Customer
```prisma
model Customer {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  email       String?
  phone       String
  location    String
  address     String?
  assignedTo  String   @db.ObjectId
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  visits      CustomerVisit[]
}
```

#### CustomerVisit
```prisma
model CustomerVisit {
  id                String   @id @default(auto()) @map("_id") @db.ObjectId
  customerId        String   @db.ObjectId
  executiveId       String   @db.ObjectId
  visitDate         DateTime
  location          String
  peoplePresent     String?
  productsDiscussed String?
  reasonForVisit    String?
  customerConcerns  String?
  investigationStatus String?
  rootCause         String?
  correctiveAction  String?
  recommendations   String?
  feedback          String?
  reportCompletedBy String
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  customer          Customer @relation(fields: [customerId], references: [id])
}
```

#### ChatMessage
```prisma
model ChatMessage {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  senderId  String   @db.ObjectId
  receiverId String? @db.ObjectId
  content   String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
  sender    User     @relation("SentMessages", fields: [senderId], references: [id])
  receiver  User?    @relation("ReceivedMessages", fields: [receiverId], references: [id])
}
```

#### CapturedImage
```prisma
model CapturedImage {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  executiveId String   @db.ObjectId
  imageData   Bytes
  latitude    Float?
  longitude   Float?
  description String?
  createdAt   DateTime @default(now())
}
```

#### Signature
```prisma
model Signature {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  executiveId String   @db.ObjectId
  signatureData Bytes
  context     String?
  createdAt   DateTime @default(now())
}
```

#### OfflineData
```prisma
model OfflineData {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  executiveId String   @db.ObjectId
  dataType    String
  data        String
  synced      Boolean  @default(false)
  createdAt   DateTime @default(now())
  syncedAt    DateTime?
}
```

## Error Handling

All APIs follow consistent error handling patterns:

### Common Error Responses

#### 400 Bad Request
```json
{
  "message": "Invalid request data"
}
```

#### 401 Unauthorized
```json
{
  "message": "Invalid credentials"
}
```

#### 403 Forbidden
```json
{
  "message": "Not a Field Executive"
}
```

#### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

#### 500 Internal Server Error
```json
{
  "message": "Server error occurred"
}
```

## Testing

### Prerequisites
1. Ensure MongoDB is running
2. Run database migrations: `npx prisma db push`
3. Start the server: `npm start`

### API Testing with Postman

1. **Authentication**: First, login to get JWT token
   ```
   POST /auth/login
   {
     "email": "executive@example.com",
     "password": "password"
   }
   ```

2. **Use the token** in subsequent requests:
   ```
   Authorization: Bearer <jwt-token>
   ```

### Sample Test Flow

1. Submit location
2. Get assigned tasks
3. Update task status
4. Get assigned customers
5. Create visit report
6. Add products to cart
7. Place order
8. Capture signature
9. Sync offline data

## Swagger Documentation

All APIs are documented with Swagger/OpenAPI specifications. Access the interactive documentation at:
```
http://localhost:3000/api-docs
```

## Security Considerations

1. **Authentication**: All endpoints require valid JWT tokens
2. **Authorization**: Field executives can only access their own data
3. **Input Validation**: All inputs are validated and sanitized
4. **File Upload**: Image uploads are limited to 10MB and image files only
5. **Rate Limiting**: Consider implementing rate limiting for production

## Performance Considerations

1. **Database Indexing**: Proper indexes are in place for frequently queried fields
2. **Pagination**: Consider implementing pagination for large datasets
3. **Caching**: Implement caching for frequently accessed data
4. **Image Storage**: Consider using cloud storage for images in production

## Deployment Notes

1. **Environment Variables**: Ensure all required environment variables are set
2. **Database**: Run migrations before deployment
3. **File Storage**: Configure proper file storage for production
4. **Monitoring**: Implement logging and monitoring for production use

## Support

For technical support or questions about these APIs, please contact the development team or refer to the main project documentation.
