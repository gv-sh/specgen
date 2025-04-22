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

echo -e "${BLUE}Setting up SpecGen production environment...${NC}"

# Update system and install dependencies
echo -e "${GREEN}Updating system and installing dependencies...${NC}"
apt update && apt upgrade -y
apt install -y nodejs npm nginx git
npm install -g pm2

# Clone repository if not already present
if [ ! -d "specgen" ]; then
    echo -e "${GREEN}Cloning repository...${NC}"
    git clone https://github.com/gv-sh/specgen.git
fi

cd specgen

# Install dependencies and build frontends
echo -e "${GREEN}Installing server dependencies...${NC}"
cd server
npm install

echo -e "${GREEN}Building admin interface...${NC}"
cd ../admin
npm install
npm run build

echo -e "${GREEN}Building user interface...${NC}"
cd ../user
npm install
npm run build

# Configure Nginx
echo -e "${GREEN}Configuring Nginx...${NC}"
cat > /etc/nginx/sites-available/specgen << 'EOL'
server {
    listen 80;
    server_name _;

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /admin {
        alias $(pwd)/admin/build;
        try_files $uri $uri/ /admin/index.html;
    }

    location / {
        root $(pwd)/user/build;
        try_files $uri $uri/ /index.html;
    }
}
EOL

# Enable Nginx configuration
ln -sf /etc/nginx/sites-available/specgen /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Start server with PM2
echo -e "${GREEN}Starting server with PM2...${NC}"
cd ../server
pm2 start npm --name "specgen-server" -- start
pm2 startup
pm2 save

# Set up firewall
echo -e "${GREEN}Configuring firewall...${NC}"
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable

echo -e "${BLUE}SpecGen has been deployed!${NC}"
echo -e "Server API: ${GREEN}http://localhost:3000/api${NC}"
echo -e "Admin Interface: ${GREEN}http://localhost:3000/admin${NC}"
echo -e "User Interface: ${GREEN}http://localhost:3000${NC}"

# Print maintenance commands
echo -e "\n${BLUE}Maintenance Commands:${NC}"
echo -e "View logs: ${GREEN}pm2 logs specgen-server${NC}"
echo -e "Restart server: ${GREEN}pm2 restart specgen-server${NC}"
echo -e "Monitor server: ${GREEN}pm2 monit${NC}" 