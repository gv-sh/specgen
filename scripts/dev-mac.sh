#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the absolute path of the project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo -e "${BLUE}Setting up SpecGen development environment...${NC}"

# Install dependencies for all components
echo -e "${GREEN}Installing dependencies...${NC}"
cd "${PROJECT_ROOT}"
npm install

# Start all components in a single terminal window
echo -e "${GREEN}Starting all components...${NC}"
osascript -e "tell app \"Terminal\" to do script \"cd '${PROJECT_ROOT}' && npm run dev\""

echo -e "${BLUE}SpecGen is starting up...${NC}"
echo -e "Server API: ${GREEN}http://localhost:3000/api${NC}"
echo -e "Admin Interface: ${GREEN}http://localhost:3000/admin${NC}"
echo -e "User Interface: ${GREEN}http://localhost:3000${NC}" 