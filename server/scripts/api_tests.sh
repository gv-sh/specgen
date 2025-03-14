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
  echo "$result" # Return the result
}

echo "==== Starting SpecGen API Tests ===="

# Test Categories API
echo -e "\n${YELLOW}=== Categories API Tests ===${NC}"

# Get all categories
run_test "Get all categories" "curl -s $BASE_URL/categories"

# Create a new category - using single-line JSON to avoid issues
cat_response=$(run_test "Create a new category" "curl -s -X POST $BASE_URL/categories -H \"Content-Type: application/json\" -d '{\"name\":\"Test Category\",\"visibility\":\"Show\"}'")

# Get all categories again to see new category
run_test "Get all categories after adding new one" "curl -s $BASE_URL/categories"

# Get the first category ID
categories_response=$(curl -s $BASE_URL/categories)
first_category_id=$(echo "$categories_response" | jq -r '.data[0].id')
cat_name=$(echo "$categories_response" | jq -r '.data[0].name')

if [ "$first_category_id" != "null" ] && [ "$first_category_id" != "" ]; then
  echo -e "${GREEN}Using category: $cat_name (ID: $first_category_id)${NC}"
  run_test "Get category by ID ($first_category_id)" "curl -s $BASE_URL/categories/$first_category_id"
  
  # Update a category
  run_test "Update a category" "curl -s -X PUT $BASE_URL/categories/$first_category_id -H \"Content-Type: application/json\" -d '{\"name\":\"Updated Category Name\"}'"
  cat_name="Updated Category Name"

  # Test Parameters API
  echo -e "\n${YELLOW}=== Parameters API Tests ===${NC}"
  
  # Get all parameters
  run_test "Get all parameters" "curl -s $BASE_URL/parameters"
  
  # Get parameters by category
  run_test "Get parameters by category" "curl -s \"$BASE_URL/parameters?categoryId=$first_category_id\""
  
  # Clear existing parameters
  params_resp=$(curl -s "$BASE_URL/parameters?categoryId=$first_category_id")
  params=$(echo "$params_resp" | jq -r '.data')
  
  if [ "$params" != "[]" ] && [ "$params" != "null" ]; then
    echo -e "${YELLOW}Existing parameters found, clearing them first...${NC}"
    
    # Delete all parameters for this category
    for param_id in $(echo "$params" | jq -r '.[].id'); do
      curl -s -X DELETE "$BASE_URL/parameters/$param_id" > /dev/null
      echo -e "${YELLOW}Deleted parameter: $param_id${NC}"
    done
  fi
  
  # Create a dropdown parameter
  dropdown_resp=$(run_test "Create a dropdown parameter" "curl -s -X POST $BASE_URL/parameters -H \"Content-Type: application/json\" -d '{\"name\":\"Test Dropdown\",\"type\":\"Dropdown\",\"visibility\":\"Basic\",\"categoryId\":\"$first_category_id\",\"values\":[{\"id\":\"test-1\",\"label\":\"Test 1\"},{\"id\":\"test-2\",\"label\":\"Test 2\"}]}'")
  
  dropdown_id=$(echo "$dropdown_resp" | jq -r '.data.id')
  dropdown_name=$(echo "$dropdown_resp" | jq -r '.data.name')
  
  # Create a slider parameter
  slider_resp=$(run_test "Create a slider parameter" "curl -s -X POST $BASE_URL/parameters -H \"Content-Type: application/json\" -d '{\"name\":\"Test Slider\",\"type\":\"Slider\",\"visibility\":\"Basic\",\"categoryId\":\"$first_category_id\",\"config\":{\"min\":0,\"max\":100,\"step\":1}}'")
  
  slider_id=$(echo "$slider_resp" | jq -r '.data.id')
  slider_name=$(echo "$slider_resp" | jq -r '.data.name')
  
  # Create a toggle parameter
  toggle_resp=$(run_test "Create a toggle parameter" "curl -s -X POST $BASE_URL/parameters -H \"Content-Type: application/json\" -d '{\"name\":\"Test Toggle\",\"type\":\"Toggle Switch\",\"visibility\":\"Basic\",\"categoryId\":\"$first_category_id\",\"values\":{\"on\":\"Yes\",\"off\":\"No\"}}'")
  
  toggle_id=$(echo "$toggle_resp" | jq -r '.data.id')
  toggle_name=$(echo "$toggle_resp" | jq -r '.data.name')
  
  # Get parameter by ID
  if [ "$dropdown_id" != "null" ] && [ "$dropdown_id" != "" ]; then
    run_test "Get parameter by ID" "curl -s $BASE_URL/parameters/$dropdown_id"
    
    # Update a parameter
    run_test "Update a parameter" "curl -s -X PUT $BASE_URL/parameters/$dropdown_id -H \"Content-Type: application/json\" -d '{\"name\":\"Updated Parameter Name\"}'"
    dropdown_name="Updated Parameter Name"
  fi
  
  # Show all parameter names
  echo -e "${YELLOW}Created parameters:${NC}"
  echo -e "Dropdown: $dropdown_name ($dropdown_id)"
  echo -e "Slider: $slider_name ($slider_id)"
  echo -e "Toggle: $toggle_name ($toggle_id)"
  
  # Test Generation API
  echo -e "\n${YELLOW}=== Generation API Tests ===${NC}"
  
  # Test with dropdown parameter
  if [ "$dropdown_id" != "null" ] && [ "$dropdown_id" != "" ]; then
    run_test "Generate fiction with dropdown" "curl -s -X POST $BASE_URL/generate -H \"Content-Type: application/json\" -d '{\"$cat_name\":{\"$dropdown_name\":\"Test 1\"}}'"
  else
    echo -e "${RED}No dropdown parameter available for generation test${NC}"
  fi
  
  # Test with slider parameter
  if [ "$slider_id" != "null" ] && [ "$slider_id" != "" ]; then
    run_test "Generate fiction with slider" "curl -s -X POST $BASE_URL/generate -H \"Content-Type: application/json\" -d '{\"$cat_name\":{\"$slider_name\":50}}'"
  else
    echo -e "${RED}No slider parameter available for generation test${NC}"
  fi
  
  # Test with toggle parameter
  if [ "$toggle_id" != "null" ] && [ "$toggle_id" != "" ]; then
    run_test "Generate fiction with toggle" "curl -s -X POST $BASE_URL/generate -H \"Content-Type: application/json\" -d '{\"$cat_name\":{\"$toggle_name\":true}}'"
  else
    echo -e "${RED}No toggle parameter available for generation test${NC}"
  fi
  
  # Test combined generation
  if [ "$dropdown_id" != "null" ] && [ "$slider_id" != "null" ] && [ "$toggle_id" != "null" ]; then
    combined_payload="{\"$cat_name\":{\"$dropdown_name\":\"Test 1\",\"$slider_name\":50,\"$toggle_name\":true}}"
    run_test "Generate fiction with combined parameters" "curl -s -X POST $BASE_URL/generate -H \"Content-Type: application/json\" -d '$combined_payload'"
  fi
  
  # Test Parameter Deletion
  echo -e "\n${YELLOW}=== Parameter Deletion Tests ===${NC}"
  
  # Create a parameter just for deletion
  deletion_param_resp=$(run_test "Create parameter for deletion" "curl -s -X POST $BASE_URL/parameters -H \"Content-Type: application/json\" -d '{\"name\":\"Parameter To Delete\",\"type\":\"Dropdown\",\"visibility\":\"Basic\",\"categoryId\":\"$first_category_id\",\"values\":[{\"id\":\"del-1\",\"label\":\"Delete 1\"},{\"id\":\"del-2\",\"label\":\"Delete 2\"}]}'")
  
  deletion_param_id=$(echo "$deletion_param_resp" | jq -r '.data.id')
  
  if [ "$deletion_param_id" != "null" ] && [ "$deletion_param_id" != "" ]; then
    run_test "Delete a parameter" "curl -s -X DELETE $BASE_URL/parameters/$deletion_param_id"
  else
    echo -e "${RED}Failed to create parameter for deletion test${NC}"
  fi
  
  # Test Category Deletion
  echo -e "\n${YELLOW}=== Category Deletion Tests ===${NC}"
  
  # Create a category just for deletion
  deletion_cat_resp=$(run_test "Create category for deletion" "curl -s -X POST $BASE_URL/categories -H \"Content-Type: application/json\" -d '{\"name\":\"Category To Delete\",\"visibility\":\"Show\"}'")
  
  deletion_cat_id=$(echo "$deletion_cat_resp" | jq -r '.data.id')
  
  if [ "$deletion_cat_id" != "null" ] && [ "$deletion_cat_id" != "" ]; then
    run_test "Delete a category" "curl -s -X DELETE $BASE_URL/categories/$deletion_cat_id"
  else
    echo -e "${RED}Failed to create category for deletion test${NC}"
  fi
else
  echo -e "${RED}No categories found to test. Check if server is running and database is initialized.${NC}"
fi

echo -e "\n${GREEN}==== SpecGen API Tests Completed ====${NC}"