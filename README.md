# SpecGen

SpecGen is a locally-hosted application for generating speculative fiction using AI. The system consists of an Express backend API and two independent React frontends (admin and user interfaces).

## Project Structure

```
/specgen/
├── server/        # Express backend API
├── admin/         # React admin interface
└── user/          # React user interface
```

## Backend API

The Express backend provides API endpoints for managing categories and parameters, as well as generating fiction through OpenAI integration.

### Prerequisites

- Node.js (version 14+ recommended)
- npm

### Setup

1. Clone the repository
2. Navigate to the server directory
3. Install dependencies:
   ```bash
   cd server
   npm install
   ```

4. Configure environment variables:
   - Create a `.env` file in the `server` directory
   - Add your OpenAI API key: `OPENAI_API_KEY=your_key_here`
   - Optionally set the port: `PORT=3001`

5. Start the server:
   ```bash
   npm run dev  # For development with nodemon
   npm start    # For production
   ```

### API Endpoints

#### Categories
- `GET /api/categories`: List all categories
- `GET /api/categories/:id`: Get category details
- `POST /api/categories`: Create category
- `PUT /api/categories/:id`: Update category
- `DELETE /api/categories/:id`: Delete category

#### Parameters
- `GET /api/parameters`: List all parameters
- `GET /api/parameters/:id`: Get parameter details
- `POST /api/parameters`: Create parameter
- `PUT /api/parameters/:id`: Update parameter
- `DELETE /api/parameters/:id`: Delete parameter

#### Generation
- `POST /api/generate`: Send parameters to AI service to generate fiction

### Testing

Run tests:
```bash
npm test
```

### API Documentation

Access Swagger UI:
- Open `http://localhost:3001/api-docs` in your browser

## Data Structure

Categories and parameters are stored in a JSON file with the following structure:

```json
{
  "categories": [
    {
      "id": "science-fiction",
      "name": "Science Fiction",
      "visibility": "Show"
    }
  ],
  "parameters": [
    {
      "id": "science-fiction-technology-level",
      "name": "Technology Level",
      "type": "Dropdown",
      "visibility": "Basic",
      "categoryId": "science-fiction",
      "values": [
        {"id": "near-future", "label": "Near Future"},
        {"id": "advanced", "label": "Advanced"}
      ]
    }
  ]
}
```

## Parameter Types

- **Dropdown**: 4-12 selectable values
- **Slider**: Min/max value configuration
- **Toggle Switch**: Two options (binary choice)
- **Radio Buttons**: 4-7 mutually exclusive options
- **Checkbox**: 4-7 multi-selectable options

## Technologies

- Backend: Express.js, Node.js
- Frontend: React
- AI Integration: OpenAI API
- Database: JSON file-based storage
- Testing: Jest, Supertest

## License

This project is for internal use only.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request