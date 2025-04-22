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

All components run on port 3000 with different paths:

- **Server API**: http://localhost:3000/api
- **API Documentation**: http://localhost:3000/api-docs
- **Admin Interface**: http://localhost:3000/admin
- **User Interface**: http://localhost:3000

## Development Setup

1. Clone the repository
2. Install dependencies for each component:
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install admin dependencies
   cd ../admin
   npm install

   # Install user dependencies
   cd ../user
   npm install
   ```

3. Start each component:
   ```bash
   # Start the server
   cd server
   npm start

   # Start the admin interface
   cd ../admin
   npm start

   # Start the user interface
   cd ../user
   npm start
   ```

## Production Deployment

### Prerequisites
- Node.js (v14 or higher)
- npm
- A server with Ubuntu 22.04 LTS or similar
- Nginx
- PM2 (for process management)

### Deployment Steps

1. SSH into your server:
   ```bash
   ssh root@your_server_ip
   ```

2. Update the system and install dependencies:
   ```bash
   apt update && apt upgrade -y
   apt install -y nodejs npm nginx git
   npm install -g pm2
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
   nano .env
   ```
   Add the following content:
   ```
   OPENAI_API_KEY=your_key_here
   PORT=3000
   NODE_ENV=production
   ```

6. Build the frontend applications:
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

7. Configure Nginx:
   ```bash
   sudo nano /etc/nginx/sites-available/specgen
   ```
   Add the following configuration:
   ```nginx
   server {
       listen 80;
       server_name your_domain_or_ip;

       location /api {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location /admin {
           alias /path/to/specgen/admin/build;
           try_files $uri $uri/ /admin/index.html;
       }

       location / {
           root /path/to/specgen/user/build;
           try_files $uri $uri/ /index.html;
       }
   }
   ```

8. Enable the Nginx configuration:
   ```bash
   ln -s /etc/nginx/sites-available/specgen /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

9. Start the server with PM2:
   ```bash
   cd /path/to/specgen/server
   pm2 start npm --name "specgen-server" -- start
   pm2 startup
   pm2 save
   ```

### Security Considerations

1. Set up a firewall:
   ```bash
   ufw allow ssh
   ufw allow http
   ufw allow https
   ufw enable
   ```

2. Create a non-root user:
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
  cd /path/to/specgen
  git pull
  cd server
  npm install
  pm2 restart specgen-server
  cd ../admin
  npm install
  npm run build
  cd ../user
  npm install
  npm run build
  ```

## License

This project is for internal use only.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request