#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Updating SpecGen...${NC}"

# Pull latest changes
echo -e "${GREEN}Pulling latest changes...${NC}"
git pull

# Update server
echo -e "${GREEN}Updating server...${NC}"
cd server
npm install

# Update admin
echo -e "${GREEN}Updating admin interface...${NC}"
cd ../admin
npm install
npm run build

# Update user
echo -e "${GREEN}Updating user interface...${NC}"
cd ../user
npm install
npm run build

# Restart server if using PM2 (Ubuntu)
if command -v pm2 &> /dev/null; then
    echo -e "${GREEN}Restarting server...${NC}"
    cd ../server
    pm2 restart specgen-server
fi

echo -e "${BLUE}SpecGen has been updated!${NC}" 