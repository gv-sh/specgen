# SpecGen

SpecGen is a locally-hosted application for generating speculative fiction using AI. The system consists of an Express backend API and two independent React frontends (admin and user interfaces).

## Project Structure

```
/specgen/
├── server/        # Express backend API
├── admin/         # React admin interface
└── user/          # React user interface
```

## Port Configuration

The application consists of three main components, each running on a different port:

- **Server API**: Runs on port 3001
- **Admin Interface**: Runs on port 3000
- **User Interface**: Runs on port 3002

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

## Frontend Applications

### Admin Interface

The admin interface provides tools for managing categories and parameters.

#### Setup

1. Navigate to the admin directory:
   ```bash
   cd admin
   npm install
   ```

2. Start the admin interface:
   ```bash
   npm start
   ```

3. Access the admin interface at: http://localhost:3000

### User Interface

The user interface allows users to generate fiction based on selected parameters.

#### Setup

1. Navigate to the user directory:
   ```bash
   cd user
   npm install
   ```

2. Start the user interface:
   ```bash
   npm start
   ```

3. Access the user interface at: http://localhost:3002

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

## Sample Frontend Configuration

## Frontend Configuration

### Admin Frontend Configuration

```jsx
// admin/src/services/api.js
const API_BASE_URL = 'http://localhost:3001/api';

export const fetchCategories = async () => {
  const response = await fetch(`${API_BASE_URL}/categories`);
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  const data = await response.json();
  return data.data;
};

export const fetchParameters = async (categoryId) => {
  const url = categoryId 
    ? `${API_BASE_URL}/parameters?categoryId=${categoryId}` 
    : `${API_BASE_URL}/parameters`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch parameters');
  }
  const data = await response.json();
  return data.data;
};

// Add other API functions (create, update, delete) for both categories and parameters
```

## Environment Variables

### Server (.env)

```
PORT=3001
OPENAI_API_KEY=your_openai_api_key
NODE_ENV=development
```

### Admin and User

You can set the API URL using the `REACT_APP_API_URL` environment variable. If not set, it defaults to `http://localhost:3001`.

## Development

For development, you can run all three components simultaneously using separate terminal windows.

## Production

For production, the server can serve both the admin and user interfaces as static files. The server is configured to serve:

- Admin interface at `/admin`
- User interface at the root path

## License

This project is for internal use only.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## DigitalOcean Deployment

### Prerequisites
- A DigitalOcean account
- A DigitalOcean droplet with Ubuntu 22.04 LTS
- SSH access to the droplet (using password authentication)

### Deployment Steps

1. SSH into your DigitalOcean droplet:
   ```bash
   ssh root@your_droplet_ip
   ```

2. Update the system and install required dependencies:
   ```bash
   apt update && apt upgrade -y
   apt install -y nodejs npm nginx git
   ```

3. Clone the repository:
   ```bash
   git clone https://github.com/gv-sh/specgen.git
   cd specgen
   ```

4. Set up the server:
   ```bash
   cd server
   npm install
   ```

5. Create and configure the environment file:
   ```bash
   # Stop the server if it's running
   pm2 stop specgen-server
   
   # Create and edit the .env file
   nano .env
   ```
   Add the following content (replace with your actual OpenAI API key):
   ```
   OPENAI_API_KEY=your_key_here
   PORT=3001
   NODE_ENV=production
   ```
   
   # Verify the environment file
   cat .env
   
   # Restart the server with the new environment
   pm2 restart specgen-server
   ```

6. Install PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start npm --name "specgen-server" -- start
   pm2 startup
   pm2 save
   ```

7. Configure Nginx as a reverse proxy:
   ```bash
   sudo nano /etc/nginx/sites-available/specgen
   ```
   Add the following configuration:
   ```nginx
server {
    listen 80;
    server_name your_domain_or_ip;

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        root /var/www/specgen;
        try_files $uri $uri/ /index.html;
    }
}
   ```

1. Enable the Nginx configuration:
   ```bash
   ln -s /etc/nginx/sites-available/specgen /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

2. Build and deploy the frontend applications:
   ```bash
   # Build admin frontend
   cd ../admin
   npm install
   npm run build

   # Build user frontend
   cd ../user
   npm install
   npm run build
   ```

### Deploying the User Frontend

After deploying the server, follow these steps to deploy the user frontend:

1. Navigate to the user frontend directory:
   ```bash
   cd /root/specgen/user
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a production environment file:
   ```bash
   nano .env.production
   ```
   Add the following content (replace with your actual server URL):
   ```
   REACT_APP_API_URL=http://your_droplet_ip/api
   ```

4. Build the production version:
   ```bash
   npm run build
   ```

5. Verify the build was successful:
   ```bash
   ls -la build/
   ```
   You should see the compiled files in the build directory.

6. The Nginx configuration we set up earlier will serve the user frontend from the build directory. If you need to update the frontend in the future, simply rebuild it:
   ```bash
   cd /root/specgen/user
   npm run build
   ```

7. If you're using a domain name, update your DNS settings to point to your DigitalOcean droplet IP.

### Accessing the API

After deployment, the API will be accessible at:
```
http://your_droplet_ip/api
```

Example API endpoints:
- List categories: `GET http://your_droplet_ip/api/categories`
- List parameters: `GET http://your_droplet_ip/api/parameters`
- Generate fiction: `POST http://your_droplet_ip/api/generate`

You can test the API using curl:
```bash
# List categories
curl http://your_droplet_ip/api/categories

# List parameters
curl http://your_droplet_ip/api/parameters

# Generate fiction (example)
curl -X POST http://your_droplet_ip/api/generate \
  -H "Content-Type: application/json" \
  -d '{"parameters": {...}}'
```

Note: Replace `your_droplet_ip` with your actual DigitalOcean droplet IP address or domain name.

### Troubleshooting

If you're getting a 404 Not Found error, follow these steps to diagnose and fix the issue:

1. Check if the Express server is running:
   ```bash
   pm2 status
   pm2 logs specgen-server
   ```

2. Verify Nginx configuration:
   ```bash
   # Check Nginx configuration syntax
   nginx -t
   
   # Check Nginx error logs
   tail -f /var/log/nginx/error.log
   
   # Check Nginx access logs
   tail -f /var/log/nginx/access.log
   ```

3. Verify the server is listening on port 3001:
   ```bash
   netstat -tulpn | grep 3001
   ```

4. Test the API directly (bypassing Nginx):
   ```bash
   curl http://localhost:3001/api/categories
   ```

5. Common fixes:
   - If the server isn't running: `pm2 restart specgen-server`
   - If Nginx config is incorrect: `systemctl restart nginx`
   - If port 3001 isn't listening: Check the .env file and server configuration
   - If files are missing: Verify the build process completed successfully

### Security Considerations

1. Set up a firewall:
   ```bash
   ufw allow ssh
   ufw allow http
   ufw allow https
   ufw enable
   ```

2. Create a non-root user for better security:
   ```bash
   adduser specgen
   usermod -aG sudo specgen
   ```

3. Set up SSL with Let's Encrypt:
   ```bash
   apt install -y certbot python3-certbot-nginx
   certbot --nginx -d your_domain
   ```

### Maintenance

- Monitor the application: `pm2 monit`
- View logs: `pm2 logs specgen-server`
- Restart the server: `pm2 restart specgen-server`
- Update the application:
  ```bash
  cd /root/specgen
  git pull
  cd server
  npm install
  pm2 restart specgen-server
  cd ../user
  npm install
  npm run build
  ```