# Ecommerce Frontend

A React-based frontend application for an ecommerce platform with authentication, product browsing, and shopping cart functionality.

## Features

- **Product Catalog**: Browse and view detailed product information
- **Shopping Cart**: Add/remove products with persistent cart state
- **User Authentication**: Login/logout with JWT token management
- **Responsive Design**: Modern UI with React Router navigation
- **State Management**: Context API for authentication and cart state

## Tech Stack

- React 18.2.0
- React Router DOM 6.14.1
- React Scripts 5.0.1
- Context API for state management

## Installation

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

Start the development server:

```bash
npm start
```

The application will open in your browser at `http://localhost:3000`.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Runs tests (currently disabled)

## Project Structure

```
frontend/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── components/         # React components
│   │   ├── Cart.js         # Shopping cart component
│   │   ├── Login.js        # Login form component
│   │   ├── ProductDetail.js # Product detail view
│   │   └── ProductList.js  # Product listing component
│   ├── AuthContext.js      # Authentication context
│   ├── CartContext.js      # Shopping cart context
│   ├── api.js             # API utility functions
│   ├── App.js             # Main application component
│   └── index.js           # Application entry point
├── package.json           # Dependencies and scripts
└── .gitignore            # Git ignore rules
```

## Components

### ProductList

- Displays a grid of products
- Shows product images, names, and prices
- Links to individual product detail pages

### ProductDetail

- Shows detailed product information
- Add to cart functionality
- Back navigation to product list

### Cart

- Displays items in shopping cart
- Quantity management
- Remove items functionality
- Persistent cart state

### Login

- User authentication form
- JWT token management
- Redirect after successful login

## Context Providers

### AuthContext

- Manages user authentication state
- Handles login/logout functionality
- Provides JWT token to authenticated requests

### CartContext

- Manages shopping cart state
- Persists cart data in localStorage
- Provides cart operations (add, remove, update quantity)

## API Integration

The frontend communicates with the backend API through:

- REST endpoints for products (`/products`, `/products/:id`)
- GraphQL endpoint for user profile (`/graphql`)
- JWT authentication for protected routes

## Authentication

- Login credentials: `user@example.com` / `password123`
- JWT tokens are stored in localStorage
- Automatic token refresh handling
- Protected routes require authentication

## Styling

The application uses inline styles for simplicity. For production, consider:

- CSS Modules
- Styled Components
- Tailwind CSS
- Material-UI or other component libraries

## Development Notes

- Cart state persists across browser sessions
- Authentication state is maintained in memory
- API calls are made to `http://localhost:4000` by default
- Error handling for network requests
- Loading states for better UX

## Building for Production

To create a production build:

```bash
npm run build
```

This will create an optimized build in the `build` folder.

## Browser Support

The application supports modern browsers:

- Chrome (last version)
- Firefox (last version)
- Safari (last version)
- Edge (last version)
