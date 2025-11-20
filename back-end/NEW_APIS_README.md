# New Admin APIs Documentation

This document describes the three new APIs that have been added to the backend system.

## 1. Points to Cash Conversion API

**Endpoint:** `POST /admin/points/convert`

**Description:** Allows administrators to convert user points to cash at a specified conversion rate.

**Request Body:**
```json
{
  "userId": "string",
  "points": "number",
  "conversionRate": "number",
  "reason": "string (optional)"
}
```

**Response:**
```json
{
  "message": "Points converted to cash successfully",
  "pointsConverted": 100,
  "cashAmount": 1.00,
  "conversionRate": 0.01,
  "pointsTransaction": {...},
  "cashTransaction": {...}
}
```

**Features:**
- Validates user has sufficient points
- Creates two transaction records (points deduction + cash credit)
- Supports custom conversion rates
- Includes reason tracking

## 2. Invoice Posting API

**Endpoint:** `POST /admin/invoices`

**Description:** Allows administrators to manually create invoices for users with custom items and amounts.

**Request Body:**
```json
{
  "userId": "string",
  "totalAmount": "number",
  "items": [
    {
      "productName": "string",
      "quantity": "number",
      "unitPrice": "number"
    }
  ],
  "description": "string (optional)",
  "dueDate": "date (optional)"
}
```

**Response:**
```json
{
  "message": "Invoice created successfully",
  "invoice": {
    "id": "string",
    "orderId": "string",
    "invoiceDate": "date",
    "totalAmount": 150.00,
    "pdfUrl": "string",
    "order": {...},
    "user": {...}
  }
}
```

**Features:**
- Creates custom products for invoice items
- Validates total amount matches item calculations
- Generates PDF URL for invoice
- Links to user and creates order records

## 3. Individual Report API

**Endpoint:** `GET /admin/reports/individual`

**Description:** Generates comprehensive individual user reports with multiple report types and date filtering.

**Query Parameters:**
- `userId` (required): User ID for the report
- `startDate` (optional): Start date for filtering
- `endDate` (optional): End date for filtering
- `reportType` (optional): Type of report (default: "performance")
  - `sales`: Sales performance data
  - `attendance`: Attendance and work hours
  - `points`: Points and cash transactions
  - `performance`: Comprehensive overview

**Response Examples:**

**Sales Report:**
```json
{
  "userId": "string",
  "userName": "string",
  "userRole": "string",
  "reportType": "sales",
  "salesData": {
    "totalSales": 1500.00,
    "totalOrders": 15,
    "totalItems": 45,
    "orders": [...]
  }
}
```

**Attendance Report:**
```json
{
  "attendanceData": {
    "totalDays": 30,
    "presentDays": 28,
    "absentDays": 2,
    "attendanceRate": 93.33,
    "averageWorkHours": 8.5,
    "attendances": [...]
  }
}
```

**Points Report:**
```json
{
  "pointsData": {
    "totalPointsEarned": 500,
    "totalPointsClaimed": 200,
    "totalCashEarned": 50.00,
    "currentBalance": 300,
    "transactions": [...]
  }
}
```

**Performance Report:**
```json
{
  "performanceData": {
    "totalSales": 1500.00,
    "totalOrders": 15,
    "attendanceRate": 93.33,
    "totalPoints": 300
  }
}
```

## Authentication & Authorization

All three APIs require:
- Valid JWT token in Authorization header: `Bearer <token>`
- Admin role permissions
- Middleware: `authenticate` and `authorizeRoles('Admin')`

## Error Handling

The APIs include comprehensive error handling:
- **400 Bad Request**: Missing/invalid required fields
- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: Insufficient role permissions
- **404 Not Found**: User not found
- **500 Internal Server Error**: Server-side errors

## Testing

Run the tests with:
```bash
npm test
```

Or run specific test file:
```bash
npm test tests/admin/new-apis.test.js
```

## Database Schema

These APIs work with the existing Prisma schema and create the necessary relationships:
- Points conversion creates `PointTransaction` records
- Invoice posting creates `Order`, `OrderItem`, and `Invoice` records
- Individual reports query existing data across multiple models

## Notes

- Points conversion validates sufficient balance before processing
- Invoice posting creates custom products for flexibility
- Individual reports support date filtering and multiple report types
- All APIs include comprehensive Swagger documentation
- Error messages are user-friendly and descriptive

## Role Update

**Note**: The role "ExternalSeller" has been renamed to "Plumber" throughout the system. All references, routes, and database models have been updated accordingly.

## New Plumber APIs

### 4. Delivery Report API

**Endpoint:** `POST /user/delivery-report`

**Description:** Allows plumbers to submit delivery reports with product details and QR code requests.

**Request Body:**
```json
{
  "product": "string",
  "quantity": 5,
  "qrRequested": true
}
```

**Response:**
```json
{
  "message": "Delivery report submitted",
  "report": {
    "id": "...",
    "userId": "...",
    "product": "...",
    "quantity": 5,
    "qrRequested": true,
    "submittedAt": "..."
  }
}
```

### 5. Warranty Registration API

**Endpoint:** `POST /user/warranty/register`

**Description:** Allows plumbers to register product warranties with QR code generation.

**Request Body:**
```json
{
  "productId": "string",
  "serialNumber": "string",
  "purchaseDate": "YYYY-MM-DD",
  "warrantyMonths": 12
}
```

**Response (201 Created):**
```json
{
  "id": "mongo_id",
  "productId": "string",
  "serialNumber": "string",
  "purchaseDate": "2025-01-15T00:00:00.000Z",
  "warrantyMonths": 12,
  "sellerId": "string",
  "registeredAt": "2025-01-15T10:10:00.000Z",
  "qrImage": "{json-string}"
}
```

### 6. Warranty Validation API

**Endpoint:** `POST /user/warranty/validate`

**Description:** Validates warranties by scanning QR codes and returns warranty information.

**Request Body:** JSON data from QR code scan
```json
{
  "serialNumber": "string",
  "productId": "string"
}
```

**Response:**
```json
{
  "message": "Warranty validated successfully",
  "warranty": {
    "id": "string",
    "productName": "string",
    "serialNumber": "string",
    "purchaseDate": "date",
    "warrantyMonths": 12,
    "expiryDate": "date",
    "isExpired": false,
    "sellerName": "string"
  }
}
```

### 7. Commissioned Work API

**Endpoint:** `POST /user/commissioned-work`

**Description:** Allows plumbers to submit commissioned work with location and QR data.

**Request Body:** `multipart/form-data`
- `latitude` (float): Latitude coordinate
- `longitude` (float): Longitude coordinate  
- `qrCode` (string): QR code data or JSON string
- `qrImage` (file): Selfie or QR image file (optional)

**Response:**
```json
{
  "message": "Commissioned work submitted successfully",
  "work": {
    "id": "string",
    "userId": "string",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "qrCode": "string",
    "hasImage": true,
    "appliedAt": "date"
  }
}
```

## Authentication & Authorization

All new Plumber APIs require:
- Valid JWT token in Authorization header: `Bearer <token>`
- Plumber role permissions
- Middleware: `authenticate` and `authorizeRoles('Plumber')`

## Identifier-based Endpoints Added (Non-breaking)

The following endpoints were added alongside existing ID-based ones to support lookups by name/code/serial without removing any current APIs.

### Users (Admin)

- GET `/admin/users/by-username/:username`
  - Fetch a user by `name`.
- PUT `/admin/users/by-username/:username`
  - Update a user by `name` (supports changing name, phone, role, password). Role-change adjusts role-specific records.
- DELETE `/admin/users/by-username/:username`
  - Delete a user by `name` with role-specific cleanup.

### Products (Admin)

- GET `/admin/products/by-name/:name`
  - Fetch product by `name`.
- PUT `/admin/products/by-name/:name`
  - Update product by `name` (can also change name).
- DELETE `/admin/products/by-name/:name`
  - Delete product by `name` with related cleanup: `warrantyCard`, `orderItem`.

### Categories (Distributor)  

- GET `/distributor/categories/by-name/:name`
  - Fetch category by `name` including product summary.
- PUT `/distributor/categories/by-name/:name`
  - Update category by `name` (validates uniqueness on rename).
- DELETE `/distributor/categories/by-name/:name`
  - Delete category by `name` (blocked if products exist).

### Warranty Cards (Admin)

- GET `/admin/warranty-cards/by-serial/:serialNumber`
  - Fetch warranty card by `serialNumber`.

### Promo Codes (Distributor)

- GET `/distributor/promo/by-code/:code`
  - Fetch promo code by `code`.

### Shift Alerts (Admin)

- GET `/admin/shift-alerts`
  - Fetch all shift alerts (new endpoint). Existing create remains: `POST /admin/shift-alerts`.

### Stock (Admin)

- DELETE `/admin/stock/:id`
  - Delete stock entry by ID (new endpoint). Existing create/get/update remain unchanged.

## Notes on Behavior

- Name-based endpoints use exact match on `name` (or `code`/`serialNumber`).
- No existing routes were removed or altered.
- Swagger annotations were added for all new routes.