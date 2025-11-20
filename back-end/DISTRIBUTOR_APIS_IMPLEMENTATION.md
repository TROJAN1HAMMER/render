# Distributor Role - Backend API Implementation

## Overview
This document outlines all the APIs implemented for the Distributor role in the backend system. The implementation includes complete CRUD operations for catalog browsing, cart management, order processing, stock management, and category management.

## 🔧 Database Schema Updates

### New Models Added
- **Cart**: Shopping cart for distributors
- **CartItem**: Individual items in the cart
- **Category**: Product categories
- **PromoCode**: Discount codes and promotions

### Updated Models
- **Product**: Added `categoryId` field for category association
- **Order**: Added `promoCodeId` field for promo code support
- **User**: Added cart and promo code relations

## 📋 Complete API Endpoints

### 1. Catalog Management

#### Browse Catalog (GET)
- **Endpoint**: `/distributor/catalog`
- **Method**: GET
- **Description**: Get all available products in catalog
- **Authentication**: Required (Distributor role)
- **Response**: List of products with stock information

### 2. Cart Management

#### Add to Cart (POST)
- **Endpoint**: `/distributor/cart`
- **Method**: POST
- **Description**: Add product to shopping cart
- **Authentication**: Required (Distributor role)
- **Request Body**:
  ```json
  {
    "productId": "string",
    "quantity": "number"
  }
  ```
- **Response**: Updated cart with added item

#### Get Cart (GET)
- **Endpoint**: `/distributor/cart`
- **Method**: GET
- **Description**: Retrieve user's shopping cart
- **Authentication**: Required (Distributor role)
- **Response**: Cart contents with total calculation

#### Remove Item from Cart (DELETE)
- **Endpoint**: `/distributor/cart/items/:itemId`
- **Method**: DELETE
- **Description**: Remove specific item from cart
- **Authentication**: Required (Distributor role)
- **Response**: Success message

#### Clear Cart (DELETE)
- **Endpoint**: `/distributor/cart`
- **Method**: DELETE
- **Description**: Clear entire shopping cart
- **Authentication**: Required (Distributor role)
- **Response**: Success message

### 3. Promo Code Management

#### Apply Promo Code (POST)
- **Endpoint**: `/distributor/promo/apply`
- **Method**: POST
- **Description**: Apply promo code to cart/order
- **Authentication**: Required (Distributor role)
- **Request Body**:
  ```json
  {
    "promoCode": "string",
    "orderAmount": "number"
  }
  ```
- **Response**: Discount calculation and final amount

#### Validate Promo Code (POST)
- **Endpoint**: `/distributor/promo/validate`
- **Method**: POST
- **Description**: Validate promo code before order placement
- **Authentication**: Required (Distributor role)
- **Request Body**:
  ```json
  {
    "promoCode": "string",
    "orderAmount": "number"
  }
  ```
- **Response**: Validation result with discount details

#### Get Active Promo Codes (GET)
- **Endpoint**: `/distributor/promo/active`
- **Method**: GET
- **Description**: Get all active promo codes
- **Authentication**: Required (Distributor role)
- **Response**: List of active promo codes

### 4. Order Management

#### Create Order (POST)
- **Endpoint**: `/distributor/order`
- **Method**: POST
- **Description**: Place a new order
- **Authentication**: Required (Distributor role)
- **Request Body**:
  ```json
  {
    "items": [
      {
        "productId": "string",
        "quantity": "number"
      }
    ]
  }
  ```
- **Response**: Order confirmation with details

#### Create Order with Promo Code (POST)
- **Endpoint**: `/distributor/order/with-promo`
- **Method**: POST
- **Description**: Place order with promo code applied
- **Authentication**: Required (Distributor role)
- **Request Body**:
  ```json
  {
    "items": [
      {
        "productId": "string",
        "quantity": "number"
      }
    ],
    "promoCode": "string"
  }
  ```
- **Response**: Order with discount applied

#### Get My Orders (GET)
- **Endpoint**: `/distributor/order`
- **Method**: GET
- **Description**: Get all orders for the distributor
- **Authentication**: Required (Distributor role)
- **Response**: List of orders with details

#### Track Order (GET)
- **Endpoint**: `/distributor/order/:id`
- **Method**: GET
- **Description**: Get detailed order information for tracking
- **Authentication**: Required (Distributor role)
- **Response**: Complete order details with pricing

#### Order Confirmation (GET)
- **Endpoint**: `/distributor/order/:id/confirmation`
- **Method**: GET
- **Description**: Get order confirmation details
- **Authentication**: Required (Distributor role)
- **Response**: Order confirmation with delivery estimate

### 5. Stock Management

#### View Stock (GET)
- **Endpoint**: `/distributor/stock`
- **Method**: GET
- **Description**: Get assigned stock items
- **Authentication**: Required (Distributor role)
- **Response**: List of stock items with product details

#### Update Stock Status (PUT)
- **Endpoint**: `/distributor/stock/:id`
- **Method**: PUT
- **Description**: Update stock item status and location
- **Authentication**: Required (Distributor role)
- **Request Body**:
  ```json
  {
    "status": "string",
    "location": "string"
  }
  ```
- **Response**: Updated stock information

#### Add Stock Item (POST)
- **Endpoint**: `/distributor/stock/items`
- **Method**: POST
- **Description**: Add new product to inventory
- **Authentication**: Required (Distributor role)
- **Request Body**:
  ```json
  {
    "name": "string",
    "price": "number",
    "stockQuantity": "number",
    "warrantyPeriodInMonths": "number",
    "categoryId": "string (optional)",
    "location": "string (optional)"
  }
  ```
- **Response**: Created product and stock information

#### Delete Stock Item (DELETE)
- **Endpoint**: `/distributor/stock/items/:id`
- **Method**: DELETE
- **Description**: Remove product from inventory
- **Authentication**: Required (Distributor role)
- **Response**: Success message

#### Update Stock Item (PUT)
- **Endpoint**: `/distributor/stock/items/:id`
- **Method**: PUT
- **Description**: Update product and stock information
- **Authentication**: Required (Distributor role)
- **Request Body**:
  ```json
  {
    "name": "string (optional)",
    "price": "number (optional)",
    "stockQuantity": "number (optional)",
    "warrantyPeriodInMonths": "number (optional)",
    "categoryId": "string (optional)",
    "location": "string (optional)"
  }
  ```
- **Response**: Updated product and stock information

### 6. Category Management

#### Get All Categories (GET)
- **Endpoint**: `/distributor/categories`
- **Method**: GET
- **Description**: Get all product categories
- **Authentication**: Required (Distributor role)
- **Response**: List of categories with product counts

#### Get Category by ID (GET)
- **Endpoint**: `/distributor/categories/:id`
- **Method**: GET
- **Description**: Get specific category details
- **Authentication**: Required (Distributor role)
- **Response**: Category details with associated products

#### Create Category (POST)
- **Endpoint**: `/distributor/categories`
- **Method**: POST
- **Description**: Create new product category
- **Authentication**: Required (Distributor role)
- **Request Body**:
  ```json
  {
    "name": "string",
    "description": "string (optional)"
  }
  ```
- **Response**: Created category information

#### Update Category (PUT)
- **Endpoint**: `/distributor/categories/:id`
- **Method**: PUT
- **Description**: Update existing category
- **Authentication**: Required (Distributor role)
- **Request Body**:
  ```json
  {
    "name": "string (optional)",
    "description": "string (optional)"
  }
  ```
- **Response**: Updated category information

#### Delete Category (DELETE)
- **Endpoint**: `/distributor/categories/:id`
- **Method**: DELETE
- **Description**: Delete category (only if no products assigned)
- **Authentication**: Required (Distributor role)
- **Response**: Success message

## 🔐 Authentication & Authorization

### Middleware
- **Authentication**: JWT token validation required for all endpoints
- **Role Check**: All endpoints restricted to users with 'Distributor' role
- **User Isolation**: Users can only access their own data (orders, cart, etc.)

### Security Features
- Input validation and sanitization
- SQL injection prevention through Prisma ORM
- User-specific data access control
- Transaction-based operations for data integrity

## 📊 Data Models

### Cart System
```javascript
Cart {
  id: ObjectId
  userId: ObjectId (ref: User)
  status: CartStatus (Active/CheckedOut/Abandoned)
  createdAt: DateTime
  updatedAt: DateTime
  items: CartItem[]
}

CartItem {
  id: ObjectId
  cartId: ObjectId (ref: Cart)
  productId: ObjectId (ref: Product)
  quantity: Int
  addedAt: DateTime
}
```

### Promo Code System
```javascript
PromoCode {
  id: ObjectId
  code: String (unique)
  description: String
  discountType: String (percentage/fixed)
  discountValue: Float
  minOrderAmount: Float?
  maxDiscount: Float?
  usageLimit: Int?
  usedCount: Int
  status: PromoCodeStatus (Active/Inactive/Expired)
  validFrom: DateTime
  validUntil: DateTime
  createdAt: DateTime
}
```

### Category System
```javascript
Category {
  id: ObjectId
  name: String (unique)
  description: String?
  createdAt: DateTime
  updatedAt: DateTime
  products: Product[]
}
```

## 🚀 Implementation Status

### ✅ Completed Features
- [x] Complete database schema with all required models
- [x] Cart management system (add, remove, clear, view)
- [x] Promo code system (apply, validate, view active codes)
- [x] Enhanced order management (create, track, confirm, history)
- [x] Stock management (view, add, update, delete items)
- [x] Category management (CRUD operations)
- [x] All API endpoints with proper authentication
- [x] Comprehensive error handling and validation
- [x] Swagger documentation for all endpoints
- [x] Transaction-based operations for data integrity

### 🔧 Technical Implementation
- **Database**: MongoDB with Prisma ORM
- **Authentication**: JWT-based with role-based access control
- **Validation**: Input validation and business logic validation
- **Error Handling**: Comprehensive error responses with appropriate HTTP status codes
- **Documentation**: Swagger/OpenAPI documentation for all endpoints
- **Security**: User isolation and role-based permissions

## 📝 Usage Examples

### Adding Item to Cart
```bash
curl -X POST /distributor/cart \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "product123",
    "quantity": 5
  }'
```

### Applying Promo Code
```bash
curl -X POST /distributor/promo/apply \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "promoCode": "SAVE20",
    "orderAmount": 100.00
  }'
```

### Creating Order with Promo Code
```bash
curl -X POST /distributor/order/with-promo \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "product123",
        "quantity": 2
      }
    ],
    "promoCode": "SAVE20"
  }'
```

### Adding New Stock Item
```bash
curl -X POST /distributor/stock/items \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Widget",
    "price": 29.99,
    "stockQuantity": 100,
    "warrantyPeriodInMonths": 24,
    "categoryId": "category123",
    "location": "Main Warehouse"
  }'
```

## 🎯 Next Steps

### Backend
1. **Testing**: Implement comprehensive unit and integration tests
2. **Performance**: Add caching for frequently accessed data
3. **Monitoring**: Add logging and monitoring for production use
4. **Rate Limiting**: Implement API rate limiting for security

### Frontend Integration
1. **API Integration**: Connect frontend widgets to new backend endpoints
2. **State Management**: Update frontend controllers to use real API data
3. **Error Handling**: Implement proper error handling in UI
4. **Loading States**: Add loading indicators for API operations

## 📚 API Documentation

All endpoints are documented with Swagger/OpenAPI and can be accessed at:
- **Swagger UI**: `/api-docs` (when swagger is configured)
- **API Collection**: Available in `BaldMann_API_Collection.json`

## 🔍 Troubleshooting

### Common Issues
1. **Authentication Errors**: Ensure JWT token is valid and not expired
2. **Role Access**: Verify user has 'Distributor' role assigned
3. **Data Validation**: Check request body format and required fields
4. **Database Connection**: Ensure MongoDB connection is established

### Error Codes
- **400**: Bad Request (invalid input)
- **401**: Unauthorized (missing/invalid token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found (resource doesn't exist)
- **500**: Internal Server Error (server-side issue)

---

**Status**: ✅ **COMPLETE** - All required distributor APIs have been implemented and are ready for frontend integration.

