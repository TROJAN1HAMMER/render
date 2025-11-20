# Company Switching API Documentation

This document describes the backend APIs for the company switching feature in the admin role.

## Overview

The company switching feature allows admin users to:
- Create and manage multiple companies
- Switch between different companies
- Assign admins to specific companies
- View their current company context

## Database Schema

### Company Model
```prisma
model Company {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  name        String   @unique
  description String?
  logoUrl     String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  admins      Admin[]
}
```

### Updated Admin Model
```prisma
model Admin {
  id        String  @id @default(auto()) @map("_id") @db.ObjectId
  userId    String  @unique @db.ObjectId
  companyId String? @db.ObjectId
  user      User    @relation(fields: [userId], references: [id])
  company   Company? @relation(fields: [companyId], references: [id])
}
```

## API Endpoints

### 1. Get All Companies
- **GET** `/admin/companies`
- **Description**: Retrieve all active companies
- **Authentication**: Required (Admin role)
- **Response**: Array of company objects

### 2. Get Company by ID
- **GET** `/admin/companies/:id`
- **Description**: Get detailed information about a specific company
- **Authentication**: Required (Admin role)
- **Parameters**: 
  - `id` (string): Company ID
- **Response**: Company object with admin details

### 3. Create Company
- **POST** `/admin/companies`
- **Description**: Create a new company
- **Authentication**: Required (Admin role)
- **Request Body**:
  ```json
  {
    "name": "string (required)",
    "description": "string (optional)",
    "logoUrl": "string (optional)"
  }
  ```
- **Response**: Created company object

### 4. Update Company
- **PUT** `/admin/companies/:id`
- **Description**: Update company details
- **Authentication**: Required (Admin role)
- **Parameters**: 
  - `id` (string): Company ID
- **Request Body**:
  ```json
  {
    "name": "string (optional)",
    "description": "string (optional)",
    "logoUrl": "string (optional)",
    "isActive": "boolean (optional)"
  }
  ```
- **Response**: Updated company object

### 5. Delete Company
- **DELETE** `/admin/companies/:id`
- **Description**: Soft delete a company (sets isActive to false)
- **Authentication**: Required (Admin role)
- **Parameters**: 
  - `id` (string): Company ID
- **Response**: Success message
- **Note**: Cannot delete companies with associated admins

### 6. Switch Company
- **POST** `/admin/companies/:id/switch`
- **Description**: Switch the current admin to a different company
- **Authentication**: Required (Admin role)
- **Parameters**: 
  - `id` (string): Target company ID
- **Response**: 
  ```json
  {
    "message": "Company switched successfully",
    "admin": {
      "id": "string",
      "user": {
        "id": "string",
        "name": "string",
        "email": "string",
        "role": "string"
      },
      "company": {
        "id": "string",
        "name": "string",
        "description": "string",
        "logoUrl": "string"
      }
    },
    "previousCompany": {
      "id": "string",
      "name": "string"
    }
  }
  ```

### 7. Get Current Company
- **GET** `/admin/companies/current`
- **Description**: Get the current admin's assigned company
- **Authentication**: Required (Admin role)
- **Response**: 
  ```json
  {
    "company": {
      "id": "string",
      "name": "string",
      "description": "string",
      "logoUrl": "string",
      "isActive": "boolean"
    }
  }
  ```

### 8. Assign Admin to Company
- **POST** `/admin/companies/:id/assign-admin`
- **Description**: Assign a specific admin to a company
- **Authentication**: Required (Admin role)
- **Parameters**: 
  - `id` (string): Company ID
- **Request Body**:
  ```json
  {
    "adminId": "string (required)"
  }
  ```
- **Response**: Updated admin object with company assignment

## Error Responses

All endpoints may return the following error responses:

- **400 Bad Request**: Invalid input data or business logic violation
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: User doesn't have Admin role
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

## Usage Examples

### Frontend Integration

The frontend can use these APIs to implement the company switching feature:

1. **Load Companies**: Call `GET /admin/companies` to populate the company selection screen
2. **Switch Company**: Call `POST /admin/companies/:id/switch` when user selects a company
3. **Get Current Context**: Call `GET /admin/companies/current` to get the current company context
4. **Update Company Info**: Use the update endpoints to manage company details

### Sample Frontend Flow

```javascript
// 1. Load available companies
const companies = await fetch('/admin/companies', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// 2. User selects a company
const selectedCompanyId = 'company-id-here';

// 3. Switch to selected company
const switchResponse = await fetch(`/admin/companies/${selectedCompanyId}/switch`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});

// 4. Get current company context
const currentCompany = await fetch('/admin/companies/current', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## Security Considerations

- All endpoints require Admin role authentication
- Company switching is logged for audit purposes
- Soft delete prevents data loss while maintaining referential integrity
- Admin assignment validation prevents unauthorized access

## Testing

Run the test suite to verify functionality:

```bash
npm test -- --testPathPattern=company.test.js
```

The test suite covers:
- Company CRUD operations
- Company switching functionality
- Error handling
- Authentication and authorization
