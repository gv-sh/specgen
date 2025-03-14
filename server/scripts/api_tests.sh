#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:3001/api"

# Function to run tests
run_test() {
  description=$1
  command=$2
  echo -e "${YELLOW}Testing: $description${NC}"
  echo -e "Running: $command"
  result=$(eval $command)
  
  # Check if command was successful
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}SUCCESS${NC}"
    echo "$result" | jq . 2>/dev/null || echo "$result"
  else
    echo -e "${RED}FAILED${NC}"
    echo "$result"
  fi
  echo "----------------------------------------"
}

echo "==== Starting SpecGen API Tests ===="

# Test Categories API
echo -e "\n${YELLOW}=== Categories API Tests ===${NC}"

# Get all categories
run_test "Get all categories" "curl -s $BASE_URL/categories"

# Create a new category
run_test "Create a new category" "curl -s -X POST $BASE_URL/categories -H \"Content-Type: application/json\" -d '{\"name\":\"Science Fiction\",\"visibility\":\"Show\"}'"

# Get all categories again to see new category
run_test "Get all categories after adding new one" "curl -s $BASE_URL/categories"

# Get category by ID (finding first category ID)
first_category_id=$(curl -s $BASE_URL/categories | jq -r '.[0].id')
if [ "$first_category_id" != "null" ] && [ "$first_category_id" != "" ]; then
  run_test "Get category by ID ($first_category_id)" "curl -s $BASE_URL/categories/$first_category_id"
  
  # Update a category
  run_test "Update a category" "curl -s -X PUT $BASE_URL/categories/$first_category_id -H \"Content-Type: application/json\" -d '{\"name\":\"Updated Science Fiction\"}'"
else
  echo -e "${RED}No categories found to test ID-specific endpoints${NC}"
fi

# Test Parameters API
echo -e "\n${YELLOW}=== Parameters API Tests ===${NC}"

# Get all parameters
run_test "Get all parameters" "curl -s $BASE_URL/parameters"

if [ "$first_category_id" != "null" ] && [ "$first_category_id" != "" ]; then
  # Get parameters by category
  run_test "Get parameters by category" "curl -s $BASE_URL/parameters?categoryId=$first_category_id"
  
  # Create a new dropdown parameter
  dropdown_response=$(curl -s -X POST $BASE_URL/parameters -H "Content-Type: application/json" -d "{
    \"name\":\"Technology Level\",
    \"type\":\"Dropdown\",
    \"visibility\":\"Basic\",
    \"categoryId\":\"$first_category_id\",
    \"values\":[
      {\"id\":\"tech-1\",\"label\":\"Stone Age\"},
      {\"id\":\"tech-2\",\"label\":\"Industrial\"},
      {\"id\":\"tech-3\",\"label\":\"Information Age\"},
      {\"id\":\"tech-4\",\"label\":\"Space Age\"}
    ]
  }")
  echo "$dropdown_response" | jq .
  dropdown_param_id=$(echo "$dropdown_response" | jq -r '.id')
  
  # Create a new slider parameter
  slider_response=$(curl -s -X POST $BASE_URL/parameters -H "Content-Type: application/json" -d "{
    \"name\":\"Story Length\",
    \"type\":\"Slider\",
    \"visibility\":\"Basic\",
    \"categoryId\":\"$first_category_id\",
    \"values\":{\"min\":100,\"max\":1000,\"step\":100}
  }")
  echo "$slider_response" | jq .
  slider_param_id=$(echo "$slider_response" | jq -r '.id')
  
  # Create a new toggle parameter
  toggle_response=$(curl -s -X POST $BASE_URL/parameters -H "Content-Type: application/json" -d "{
    \"name\":\"Happy Ending\",
    \"type\":\"Toggle\",
    \"visibility\":\"Basic\",
    \"categoryId\":\"$first_category_id\",
    \"values\":{\"on\":\"Yes\",\"off\":\"No\"}
  }")
  echo "$toggle_response" | jq .
  toggle_param_id=$(echo "$toggle_response" | jq -r '.id')
  
  # Test Generation API
  echo -e "\n${YELLOW}=== Generation API Tests ===${NC}"
  
  # Test with dropdown parameter
  if [ "$dropdown_param_id" != "null" ] && [ "$dropdown_param_id" != "" ]; then
    run_test "Generate fiction with dropdown" "curl -s -X POST $BASE_URL/generate -H \"Content-Type: application/json\" -d '{\"selectedParameters\":{\"$dropdown_param_id\":\"tech-1\"}}'"
  else
    echo -e "${RED}Failed to create dropdown parameter for generation test${NC}"
  fi
  
  # Test with slider parameter
  if [ "$slider_param_id" != "null" ] && [ "$slider_param_id" != "" ]; then
    run_test "Generate fiction with slider" "curl -s -X POST $BASE_URL/generate -H \"Content-Type: application/json\" -d '{\"selectedParameters\":{\"$slider_param_id\":500}}'"
  else
    echo -e "${RED}Failed to create slider parameter for generation test${NC}"
  fi
  
  # Test with toggle parameter
  if [ "$toggle_param_id" != "null" ] && [ "$toggle_param_id" != "" ]; then
    run_test "Generate fiction with toggle" "curl -s -X POST $BASE_URL/generate -H \"Content-Type: application/json\" -d '{\"selectedParameters\":{\"$toggle_param_id\":true}}'"
  else
    echo -e "${RED}Failed to create toggle parameter for generation test${NC}"
  fi
  
  # Test Parameter Deletion
  echo -e "\n${YELLOW}=== Parameter Deletion Tests ===${NC}"
  
  # Create a parameter specifically for deletion
  delete_param_response=$(curl -s -X POST $BASE_URL/parameters -H "Content-Type: application/json" -d "{
    \"name\":\"Parameter to Delete\",
    \"type\":\"Dropdown\",
    \"visibility\":\"Basic\",
    \"categoryId\":\"$first_category_id\",
    \"values\":[
      {\"id\":\"del-1\",\"label\":\"Delete Value 1\"},
      {\"id\":\"del-2\",\"label\":\"Delete Value 2\"}
    ]
  }")
  delete_param_id=$(echo "$delete_param_response" | jq -r '.id')
  
  if [ "$delete_param_id" != "null" ] && [ "$delete_param_id" != "" ]; then
    run_test "Delete a parameter" "curl -s -X DELETE $BASE_URL/parameters/$delete_param_id"
  else
    echo -e "${RED}Failed to create parameter for deletion test${NC}"
  fi
  
  # Test Category Deletion
  echo -e "\n${YELLOW}=== Category Deletion Tests ===${NC}"
  
  # Create a category specifically for deletion
  delete_cat_response=$(curl -s -X POST $BASE_URL/categories -H "Content-Type: application/json" -d "{
    \"name\":\"Category to Delete\",
    \"visibility\":\"Show\"
  }")
  delete_category_id=$(echo "$delete_cat_response" | jq -r '.id')
  
  if [ "$delete_category_id" != "null" ] && [ "$delete_category_id" != "" ]; then
    run_test "Delete a category" "curl -s -X DELETE $BASE_URL/categories/$delete_category_id"
    
    # Try to delete a category with parameters (should fail)
    run_test "Delete a category with parameters (should fail)" "curl -s -X DELETE $BASE_URL/categories/$first_category_id"
  else
    echo -e "${RED}Failed to create category for deletion test${NC}"
    echo "Response: $delete_cat_response"
  fi
else
  echo -e "${RED}No categories found for parameter tests${NC}"
fi

echo -e "\n${GREEN}==== SpecGen API Tests Completed ====${NC}"