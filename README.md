# SpecGen

SpecGen is a locally-hosted application for generating speculative fiction using AI, consisting of an Express backend API and two independent React frontends (admin and user interfaces).

## Project Structure

```
/specgen/
├── server/        # Express backend API
├── admin/         # React admin interface
└── user/          # React user interface
```

## Backend API

The Express backend provides API endpoints for managing categories and parameters, as well as generating fiction through OpenAI integration.

### Setup

1. Install dependencies:
   ```bash
   cd server
   npm install
   ```

2. Configure environment variables:
   - Create a `.env` file in the `server` directory
   - Add your OpenAI API key: `OPENAI_API_KEY=your_key_here`
   - Set port if needed: `PORT=3001`

3. Initialize the database with sample data:
   ```bash
   npm run init-db
   ```
   This will create a database.json file with sample categories and parameters for Science Fiction, Fantasy, and Dystopian Future stories.

4. Start the server:
   ```bash
   npm run dev
   ```

5. Access the API documentation:
   - Open a browser and go to: `http://localhost:3001/api-docs`
   - You can test the API endpoints directly from the Swagger UI

### Testing the Generate Endpoint

After initializing the database with sample data, you can test the generate endpoint with a request like:

```json
{
  "[sci-fi-category-id]": {
    "[tech-level-param-id]": "Near Future",
    "[alien-life-param-id]": true,
    "[space-exploration-param-id]": 7
  }
}
```

The specific IDs will be printed to the console when you run `npm run init-db`.

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
- `POST /api/generate`: Send parameters to AI service

### Testing

Run tests (in sequence to avoid database corruption):
```bash
npm test
```

## Admin Frontend

The Admin interface allows management of categories and parameters.

### Setup

```bash
cd admin
npm install
npm start
```

## User Frontend

The User interface allows selection of parameters and generation of fiction.

### Setup

```bash
cd user
npm install
npm start
```

## Data Structure

Categories and parameters are stored in a JSON file with the following structure:

```json
{
  "categories": [
    {
      "id": "cat-1",
      "name": "Environmental Policy",
      "visibility": "Show"
    }
  ],
  "parameters": [
    {
      "id": "param-1",
      "name": "Climate Focus",
      "type": "Dropdown",
      "visibility": "Basic",
      "categoryId": "cat-1",
      "values": [
        {"id": "val-1", "label": "Value 1"},
        {"id": "val-2", "label": "Value 2"}
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

## License

This project is for internal use only.