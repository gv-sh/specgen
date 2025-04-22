# SpecGen Admin Interface

The admin dashboard for SpecGen, providing a user-friendly interface for managing categories and parameters.

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

## Prerequisites

- Node.js (v14 or higher)
- npm
- Running SpecGen server

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables (optional):
   - Create a `.env` file
   - Set the API URL: `REACT_APP_API_URL=http://localhost:3000/api`

3. Start the development server:
   ```bash
   npm start
   ```

The admin dashboard will be available at [http://localhost:3000/admin](http://localhost:3000/admin).

## Building for Production

To create a production build:

```bash
npm run build
```

This will create an optimized build in the `build` folder.

## Technologies

- React
- React Router for navigation
- Axios for API calls
- CSS for styling
- React Icons for UI elements

## Development

The admin interface is built with React and communicates with the SpecGen server API. It provides a user-friendly interface for managing the database of categories and parameters used by the fiction generator.

### Key Components

- Category Management
- Parameter Management
- Form Validation
- Error Handling
- Success Notifications
- Confirmation Dialogs

### API Integration

The admin interface interacts with the following API endpoints:

#### Categories
- GET /api/categories - Get all categories
- POST /api/categories - Create a new category
- PUT /api/categories/:id - Update a category
- DELETE /api/categories/:id - Delete a category

#### Parameters
- GET /api/parameters - Get all parameters
- POST /api/parameters - Create a new parameter
- PUT /api/parameters/:id - Update a parameter
- DELETE /api/parameters/:id - Delete a parameter 