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
  echo -e "Command: $command"
  
  # Execute the command and capture both stdout and stderr
  result=$(eval $command 2>&1)
  status=$?
  
  # Check if command was successful
  if [ $status -eq 0 ] && [[ ! "$result" =~ "error" ]]; then
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

# Create a new category - using single-line JSON to avoid issues
run_test "Create a new category" "curl -s -X POST $BASE_URL/categories -H \"Content-Type: application/json\" -d '{\"name\":\"Test Category\",\"visibility\":\"Show\"}'"

# Get all categories again to see new category
run_test "Get all categories after adding new one" "curl -s $BASE_URL/categories"

# Find a category ID to use for tests
categories_response=$(curl -s $BASE_URL/categories)
first_category_id=$(echo "$categories_response" | jq -r '.[0].id')

if [ "$first_category_id" != "null" ] && [ "$first_category_id" != "" ]; then
  run_test "Get category by ID ($first_category_id)" "curl -s $BASE_URL/categories/$first_category_id"
  
  # Update a category
  run_test "Update a category" "curl -s -X PUT $BASE_URL/categories/$first_category_id -H \"Content-Type: application/json\" -d '{\"name\":\"Updated Category Name\"}'"

  # Test Parameters API
  echo -e "\n${YELLOW}=== Parameters API Tests ===${NC}"
  
  # Get all parameters
  run_test "Get all parameters" "curl -s $BASE_URL/parameters"
  
  # Get parameters by category
  run_test "Get parameters by category" "curl -s \"$BASE_URL/parameters?categoryId=$first_category_id\""
  
  # Create a dropdown parameter
  dropdown_response=$(curl -s -X POST $BASE_URL/parameters -H "Content-Type: application/json" -d "{\"name\":\"Test Dropdown\",\"type\":\"Dropdown\",\"visibility\":\"Basic\",\"categoryId\":\"$first_category_id\",\"values\":[{\"id\":\"test-1\",\"label\":\"Test 1\"},{\"id\":\"test-2\",\"label\":\"Test 2\"}]}")
  echo "Created dropdown parameter:"
  echo "$dropdown_response" | jq .
  dropdown_param_id=$(echo "$dropdown_response" | jq -r '.id')
  
  # Create a slider parameter
  slider_response=$(curl -s -X POST $BASE_URL/parameters -H "Content-Type: application/json" -d "{\"name\":\"Test Slider\",\"type\":\"Slider\",\"visibility\":\"Basic\",\"categoryId\":\"$first_category_id\",\"values\":{\"min\":0,\"max\":100,\"step\":1}}")
  echo "Created slider parameter:"
  echo "$slider_response" | jq .
  slider_param_id=$(echo "$slider_response" | jq -r '.id')
  
  # Create a toggle parameter
  toggle_response=$(curl -s -X POST $BASE_URL/parameters -H "Content-Type: application/json" -d "{\"name\":\"Test Toggle\",\"type\":\"Toggle\",\"visibility\":\"Basic\",\"categoryId\":\"$first_category_id\",\"values\":{\"on\":\"Yes\",\"off\":\"No\"}}")
  echo "Created toggle parameter:"
  echo "$toggle_response" | jq .
  toggle_param_id=$(echo "$toggle_response" | jq -r '.id')
  
  # Get parameter by ID
  if [ "$dropdown_param_id" != "null" ] && [ "$dropdown_param_id" != "" ]; then
    run_test "Get parameter by ID" "curl -s $BASE_URL/parameters/$dropdown_param_id"
    
    # Update a parameter
    run_test "Update a parameter" "curl -s -X PUT $BASE_URL/parameters/$dropdown_param_id -H \"Content-Type: application/json\" -d '{\"name\":\"Updated Parameter Name\"}'"
  fi
  
  # Test Generation API
  echo -e "\n${YELLOW}=== Generation API Tests ===${NC}"
  
  # Test with dropdown parameter
  if [ "$dropdown_param_id" != "null" ] && [ "$dropdown_param_id" != "" ]; then
    run_test "Generate fiction with dropdown" "curl -s -X POST $BASE_URL/generate -H \"Content-Type: application/json\" -d '{\"selectedParameters\":{\"$dropdown_param_id\":\"test-1\"}}'"
  else
    echo -e "${RED}No dropdown parameter available for generation test${NC}"
  fi
  
  # Test with slider parameter
  if [ "$slider_param_id" != "null" ] && [ "$slider_param_id" != "" ]; then
    run_test "Generate fiction with slider" "curl -s -X POST $BASE_URL/generate -H \"Content-Type: application/json\" -d '{\"selectedParameters\":{\"$slider_param_id\":50}}'"
  else
    echo -e "${RED}No slider parameter available for generation test${NC}"
  fi
  
  # Test with toggle parameter
  if [ "$toggle_param_id" != "null" ] && [ "$toggle_param_id" != "" ]; then
    run_test "Generate fiction with toggle" "curl -s -X POST $BASE_URL/generate -H \"Content-Type: application/json\" -d '{\"selectedParameters\":{\"$toggle_param_id\":true}}'"
  else
    echo -e "${RED}No toggle parameter available for generation test${NC}"
  fi
  
  # Test Parameter Deletion
  echo -e "\n${YELLOW}=== Parameter Deletion Tests ===${NC}"
  
  # Create a parameter just for deletion
  deletion_param_response=$(curl -s -X POST $BASE_URL/parameters -H "Content-Type: application/json" -d "{\"name\":\"Parameter To Delete\",\"type\":\"Dropdown\",\"visibility\":\"Basic\",\"categoryId\":\"$first_category_id\",\"values\":[{\"id\":\"del-1\",\"label\":\"Delete 1\"},{\"id\":\"del-2\",\"label\":\"Delete 2\"}]}")
  echo "Created parameter for deletion:"
  echo "$deletion_param_response" | jq .
  deletion_param_id=$(echo "$deletion_param_response" | jq -r '.id')
  
  if [ "$deletion_param_id" != "null" ] && [ "$deletion_param_id" != "" ]; then
    run_test "Delete a parameter" "curl -s -X DELETE $BASE_URL/parameters/$deletion_param_id"
  else
    echo -e "${RED}Failed to create parameter for deletion test${NC}"
  fi
  
  # Test Category Deletion
  echo -e "\n${YELLOW}=== Category Deletion Tests ===${NC}"
  
  # Create a category just for deletion
  deletion_cat_response=$(curl -s -X POST $BASE_URL/categories -H "Content-Type: application/json" -d "{\"name\":\"Category To Delete\",\"visibility\":\"Show\"}")
  echo "Created category for deletion:"
  echo "$deletion_cat_response" | jq .
  deletion_cat_id=$(echo "$deletion_cat_response" | jq -r '.id')
  
  if [ "$deletion_cat_id" != "null" ] && [ "$deletion_cat_id" != "" ]; then
    run_test "Delete a category" "curl -s -X DELETE $BASE_URL/categories/$deletion_cat_id"
    
    # Try to delete a category with parameters (should fail)
    run_test "Delete a category with parameters (should fail)" "curl -s -X DELETE $BASE_URL/categories/$first_category_id"
  else
    echo -e "${RED}Failed to create category for deletion test${NC}"
  fi
else
  echo -e "${RED}No categories found to test. Check if server is running and database is initialized.${NC}"
fi

echo -e "\n${GREEN}==== SpecGen API Tests Completed ====${NC}"