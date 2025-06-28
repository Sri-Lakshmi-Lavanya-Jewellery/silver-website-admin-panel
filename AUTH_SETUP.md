# Authentication Setup Guide

## Overview
The Silver Shop Admin panel now includes a complete authentication system with role-based access control.

## Features
- **User Authentication**: Secure login/logout functionality
- **Role-Based Access Control**: Admin, Editor, and Viewer roles
- **Protected Routes**: All dashboard routes require authentication
- **Token Management**: JWT-based authentication with refresh tokens
- **User Interface**: Login page and user profile dropdown

## User Roles
- **Admin**: Full access to all features including settings
- **Editor**: Can manage products, categories, and inventory
- **Viewer**: Read-only access to dashboard and analytics

## Protected Routes
- `/dashboard` - All roles
- `/products` - Admin, Editor only
- `/categories` - Admin, Editor only
- `/inventory` - Admin, Editor only
- `/analytics` - All roles
- `/settings` - Admin only

## Getting Started

### 1. Current Status - Real API Integration
The application is now configured for real backend authentication.

**Authentication Flow:**
- Uses real API endpoints for login/logout
- Comprehensive logging in browser console for debugging
- Token-based authentication with localStorage persistence

### 2. Backend Setup Required
The frontend is configured to work with the following API endpoints:
- `POST /auth/login` - User login
- `POST /auth/refresh` - Token refresh
- `GET /auth/me` - Get current user
- `POST /auth/logout` - User logout

### 3. Authentication Debugging
Comprehensive logging has been added to track the authentication flow:

- **🚀 Initialization**: AuthContext startup and token restoration
- **🔐 Login Process**: API calls, token storage, state updates
- **🛡️ Route Protection**: Access control and role validation
- **📝 Form Submission**: Login form handling and validation
- **🏠 Navigation**: Homepage redirects based on auth state

Check the browser console for detailed logs during authentication.

### 4. Test Users (Backend Setup)
Configure your backend with these test users:

```json
{
  "admin": {
    "email": "admin@silvershop.com",
    "password": "admin123",
    "role": "admin",
    "name": "Admin User"
  },
  "editor": {
    "email": "editor@silvershop.com", 
    "password": "editor123",
    "role": "editor",
    "name": "Editor User"
  },
  "viewer": {
    "email": "viewer@silvershop.com",
    "password": "viewer123", 
    "role": "viewer",
    "name": "Viewer User"
  }
}
```

### 5. Usage
1. Navigate to `/login` to sign in
2. Use credentials from your backend setup
3. Check browser console for detailed authentication logs
4. After successful login, you'll be redirected to `/dashboard`
5. Navigation menu adapts based on user role
6. Click user profile in header to logout

## Components

### AuthContext (`contexts/AuthContext.tsx`)
- Manages global authentication state
- Handles login, logout, token refresh
- Provides user information throughout the app

### ProtectedRoute (`components/auth/ProtectedRoute.tsx`)
- Wraps components that require authentication
- Supports role-based access control
- Redirects unauthenticated users to login

### Login Page (`app/login/page.tsx`)
- Clean, modern login interface
- Email/password authentication
- Error handling and loading states

## Implementation Details

### Model Name Editing
Product models now have editable names:
- Click on model name field to edit
- Changes are saved when you move to another field
- Prevents duplicate or empty model names

### Form Styling
All form inputs now use consistent utility classes:
- `form-input` - Standard input styling
- `form-select` - Select dropdown styling  
- `form-input-sm` - Smaller input variant

## Security Features
- JWT token storage in localStorage
- Automatic token refresh on API calls
- Route protection at component level
- Role verification for sensitive operations

## Next Steps
1. Set up backend authentication endpoints
2. Configure user database with test accounts
3. Test role-based access controls
4. Implement password reset functionality (optional)
5. Add user management for admin role (optional)
