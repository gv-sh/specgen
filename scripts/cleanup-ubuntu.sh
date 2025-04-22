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

echo -e "${BLUE}Starting SpecGen cleanup...${NC}"

# Function to handle errors
handle_error() {
    echo -e "${RED}Error: $1${NC}"
    exit 1
}

# Stop and remove PM2 process
echo -e "${GREEN}Stopping and removing PM2 process...${NC}"
if pm2 list | grep -q "specgen-server"; then
    pm2 delete specgen-server || handle_error "Failed to delete PM2 process"
fi

# Remove Nginx configuration
echo -e "${GREEN}Removing Nginx configuration...${NC}"
rm -f /etc/nginx/sites-enabled/specgen || handle_error "Failed to remove Nginx enabled config"
rm -f /etc/nginx/sites-available/specgen || handle_error "Failed to remove Nginx available config"

# Remove application files
echo -e "${GREEN}Removing application files...${NC}"
rm -rf /var/www/specgen || handle_error "Failed to remove application files"

# Restart Nginx
echo -e "${GREEN}Restarting Nginx...${NC}"
systemctl restart nginx || handle_error "Failed to restart Nginx"

echo -e "${BLUE}Cleanup completed successfully!${NC}"
echo -e "All SpecGen components have been removed from the system." 