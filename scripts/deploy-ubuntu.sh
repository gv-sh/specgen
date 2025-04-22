#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root${NC}"
    exit 1
fi

# Function to handle errors
handle_error() {
    echo -e "${RED}Error: $1${NC}"
    echo -e "${BLUE}Running cleanup...${NC}"
    bash "$(dirname "$0")/cleanup-ubuntu.sh"
    exit 1
}

echo -e "${BLUE}Setting up SpecGen production environment...${NC}"

# Update system and install dependencies
echo -e "${GREEN}Updating system and installing dependencies...${NC}"
apt update && apt upgrade -y || handle_error "Failed to update system"
apt install -y nodejs npm nginx git certbot python3-certbot-nginx || handle_error "Failed to install dependencies"
npm install -g pm2 || handle_error "Failed to install PM2"

# Clone repository if not already present
if [ ! -d "specgen" ]; then
    echo -e "${GREEN}Cloning repository...${NC}"
    git clone https://github.com/gv-sh/specgen.git || handle_error "Failed to clone repository"
fi

cd specgen || handle_error "Failed to change to specgen directory"

# Install dependencies and build frontends
echo -e "${GREEN}Installing server dependencies...${NC}"
cd server || handle_error "Failed to change to server directory"
npm install || handle_error "Failed to install server dependencies"

echo -e "${GREEN}Building admin interface...${NC}"
cd ../admin || handle_error "Failed to change to admin directory"
npm install || handle_error "Failed to install admin dependencies"
npm run build || handle_error "Failed to build admin interface"

echo -e "${GREEN}Building user interface...${NC}"
cd ../user || handle_error "Failed to change to user directory"
npm install || handle_error "Failed to install user dependencies"
npm run build || handle_error "Failed to build user interface"

# Configure Nginx
echo -e "${GREEN}Configuring Nginx...${NC}"
cat > /etc/nginx/sites-available/specgen << 'EOL'
server {
    listen 80;
    server_name _;

    # Redirect all HTTP traffic to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name _;

    # SSL configuration will be added by certbot

    # API endpoints
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Admin interface
    location /admin {
        alias /var/www/specgen/admin/build;
        try_files $uri $uri/ /admin/index.html;
    }

    # User interface
    location / {
        root /var/www/specgen/user/build;
        try_files $uri $uri/ /index.html;
    }
}
EOL

# Create directory for static files
mkdir -p /var/www/specgen/admin/build || handle_error "Failed to create admin build directory"
mkdir -p /var/www/specgen/user/build || handle_error "Failed to create user build directory"

# Copy built files to Nginx directory
cp -r admin/build/* /var/www/specgen/admin/build/ || handle_error "Failed to copy admin build files"
cp -r user/build/* /var/www/specgen/user/build/ || handle_error "Failed to copy user build files"

# Set proper permissions
chown -R www-data:www-data /var/www/specgen || handle_error "Failed to set ownership"
chmod -R 755 /var/www/specgen || handle_error "Failed to set permissions"

# Enable Nginx configuration
ln -sf /etc/nginx/sites-available/specgen /etc/nginx/sites-enabled/ || handle_error "Failed to enable Nginx config"
rm -f /etc/nginx/sites-enabled/default || handle_error "Failed to remove default Nginx config"

# Test Nginx configuration
nginx -t || handle_error "Nginx configuration test failed"

# Restart Nginx
systemctl restart nginx || handle_error "Failed to restart Nginx"

# Start server with PM2
echo -e "${GREEN}Starting server with PM2...${NC}"
cd ../server || handle_error "Failed to change to server directory"
pm2 delete specgen-server 2>/dev/null || true  # Delete if exists
pm2 start npm --name "specgen-server" -- start || handle_error "Failed to start server with PM2"
pm2 startup || handle_error "Failed to setup PM2 startup"
pm2 save || handle_error "Failed to save PM2 configuration"

# Set up firewall
echo -e "${GREEN}Configuring firewall...${NC}"
ufw allow ssh || handle_error "Failed to allow SSH"
ufw allow http || handle_error "Failed to allow HTTP"
ufw allow https || handle_error "Failed to allow HTTPS"
ufw --force enable || handle_error "Failed to enable firewall"

echo -e "${BLUE}SpecGen has been deployed!${NC}"
echo -e "Server API: ${GREEN}https://$(curl -s ifconfig.me)/api${NC}"
echo -e "Admin Interface: ${GREEN}https://$(curl -s ifconfig.me)/admin${NC}"
echo -e "User Interface: ${GREEN}https://$(curl -s ifconfig.me)${NC}"

# Print maintenance commands
echo -e "\n${BLUE}Maintenance Commands:${NC}"
echo -e "View logs: ${GREEN}pm2 logs specgen-server${NC}"
echo -e "Restart server: ${GREEN}pm2 restart specgen-server${NC}"
echo -e "Monitor server: ${GREEN}pm2 monit${NC}"
echo -e "View Nginx logs: ${GREEN}tail -f /var/log/nginx/error.log${NC}"
echo -e "View Nginx access logs: ${GREEN}tail -f /var/log/nginx/access.log${NC}"

# Print cleanup instructions
echo -e "\n${BLUE}Cleanup Instructions:${NC}"
echo -e "To completely remove SpecGen, run: ${GREEN}sudo ./scripts/cleanup-ubuntu.sh${NC}" 