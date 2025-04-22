# Admin Dashboard

This is the admin dashboard for managing the database.json file. It provides a user-friendly interface for managing categories and parameters.

## Features

- Manage Categories
  - Add new categories
  - Edit existing categories
  - Delete categories
  - View all categories

- Manage Parameters
  - Add new parameters
  - Edit existing parameters
  - Delete parameters
  - View all parameters
  - Set parameter types and requirements

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The admin dashboard will be available at [http://localhost:3001](http://localhost:3001).

## API Endpoints

The admin dashboard interacts with the following API endpoints:

### Categories
- GET /api/categories - Get all categories
- POST /api/categories - Create a new category
- PUT /api/categories/:id - Update a category
- DELETE /api/categories/:id - Delete a category

### Parameters
- GET /api/parameters - Get all parameters
- POST /api/parameters - Create a new parameter
- PUT /api/parameters/:id - Update a parameter
- DELETE /api/parameters/:id - Delete a parameter

## Development

The admin dashboard is built with:
- React
- React Router for navigation
- Axios for API calls
- CSS for styling

## Building for Production

To create a production build:

```bash
npm run build
```

This will create an optimized build in the `build` folder. 