#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the absolute path of the project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo -e "${BLUE}Setting up SpecGen development environment...${NC}"

# Install dependencies for all components
echo -e "${GREEN}Installing server dependencies...${NC}"
cd "${PROJECT_ROOT}/server"
npm install

echo -e "${GREEN}Installing admin dependencies...${NC}"
cd "${PROJECT_ROOT}/admin"
npm install

echo -e "${GREEN}Installing user dependencies...${NC}"
cd "${PROJECT_ROOT}/user"
npm install

# Start all components in separate terminal windows
echo -e "${GREEN}Starting server...${NC}"
osascript -e "tell app \"Terminal\" to do script \"cd '${PROJECT_ROOT}/server' && npm run dev\""

echo -e "${GREEN}Starting admin interface...${NC}"
osascript -e "tell app \"Terminal\" to do script \"cd '${PROJECT_ROOT}/admin' && npm start\""

echo -e "${GREEN}Starting user interface...${NC}"
osascript -e "tell app \"Terminal\" to do script \"cd '${PROJECT_ROOT}/user' && npm start\""

echo -e "${BLUE}SpecGen is starting up...${NC}"
echo -e "Server API: ${GREEN}http://localhost:3000/api${NC}"
echo -e "Admin Interface: ${GREEN}http://localhost:3000/admin${NC}"
echo -e "User Interface: ${GREEN}http://localhost:3000${NC}" 