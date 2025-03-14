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
run_test "Create a new category" "curl -s -X POST $BASE_URL/categories -H 'Content-Type: application/json' -d '{\"name\":\"Science Fiction\",\"visibility\":\"Show\"}'"

# Get all categories again to see new category
run_test "Get all categories after adding new one" "curl -s $BASE_URL/categories"

# Get category by ID (finding first category ID)
first_category_id=$(curl -s $BASE_URL/categories | jq -r '.[0].id')
if [ "$first_category_id" != "null" ] && [ "$first_category_id" != "" ]; then
  run_test "Get category by ID ($first_category_id)" "curl -s $BASE_URL/categories/$first_category_id"
  
  # Update a category
  run_test "Update a category" "curl -s -X PUT $BASE_URL/categories/$first_category_id -H 'Content-Type: application/json' -d '{\"name\":\"Updated Science Fiction\"}'"
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
  run_test "Create a dropdown parameter" "curl -s -X POST $BASE_URL/parameters -H 'Content-Type: application/json' -d '{\"name\":\"Technology Level\",\"type\":\"Dropdown\",\"visibility\":\"Basic\",\"categoryId\":\"$first_category_id\",\"values\":[{\"id\":\"tech-1\",\"label\":\"Stone Age\"},{\"id\":\"tech-2\",\"label\":\"Industrial\"},{\"id\":\"tech-3\",\"label\":\"Information Age\"},{\"id\":\"tech-4\",\"label\":\"Space Age\"}]}'"
  
  # Create a new slider parameter
  run_test "Create a slider parameter" "curl -s -X POST $BASE_URL/parameters -H 'Content-Type: application/json' -d '{\"name\":\"Story Length\",\"type\":\"Slider\",\"visibility\":\"Basic\",\"categoryId\":\"$first_category_id\",\"values\":{\"min\":100,\"max\":1000,\"step\":100}}'"
  
  # Create a new toggle parameter
  run_test "Create a toggle parameter" "curl -s -X POST $BASE_URL/parameters -H 'Content-Type: application/json' -d '{\"name\":\"Happy Ending\",\"type\":\"Toggle\",\"visibility\":\"Basic\",\"categoryId\":\"$first_category_id\",\"values\":{\"on\":\"Yes\",\"off\":\"No\"}}'"
  
  # Create a new radio parameter
  run_test "Create a radio parameter" "curl -s -X POST $BASE_URL/parameters -H 'Content-Type: application/json' -d '{\"name\":\"Main Character\",\"type\":\"Radio\",\"visibility\":\"Basic\",\"categoryId\":\"$first_category_id\",\"values\":[{\"id\":\"char-1\",\"label\":\"Hero\"},{\"id\":\"char-2\",\"label\":\"Antihero\"},{\"id\":\"char-3\",\"label\":\"Villain\"}]}'"
  
  # Create a new checkbox parameter
  run_test "Create a checkbox parameter" "curl -s -X POST $BASE_URL/parameters -H 'Content-Type: application/json' -d '{\"name\":\"Story Elements\",\"type\":\"Checkbox\",\"visibility\":\"Basic\",\"categoryId\":\"$first_category_id\",\"values\":[{\"id\":\"elem-1\",\"label\":\"Action\"},{\"id\":\"elem-2\",\"label\":\"Romance\"},{\"id\":\"elem-3\",\"label\":\"Mystery\"},{\"id\":\"elem-4\",\"label\":\"Horror\"}]}'"
  
  # Get parameters to find one to update/delete
  first_param_id=$(curl -s $BASE_URL/parameters | jq -r '.[0].id')
  if [ "$first_param_id" != "null" ] && [ "$first_param_id" != "" ]; then
    # Get parameter by ID
    run_test "Get parameter by ID" "curl -s $BASE_URL/parameters/$first_param_id"
    
    # Update a parameter
    run_test "Update a parameter" "curl -s -X PUT $BASE_URL/parameters/$first_param_id -H 'Content-Type: application/json' -d '{\"name\":\"Updated Parameter Name\"}'"
    
    # Test Generation API
    echo -e "\n${YELLOW}=== Generation API Tests ===${NC}"
    
    # Find a dropdown parameter for testing generation
    dropdown_param_id=$(curl -s $BASE_URL/parameters | jq -r '.[] | select(.type=="Dropdown") | .id' | head -1)
    if [ "$dropdown_param_id" != "" ]; then
      dropdown_value_id=$(curl -s $BASE_URL/parameters/$dropdown_param_id | jq -r '.values[0].id')
      run_test "Generate fiction with dropdown" "curl -s -X POST $BASE_URL/generate -H 'Content-Type: application/json' -d '{\"selectedParameters\":{\"$dropdown_param_id\":\"$dropdown_value_id\"}}'"
    else
      echo -e "${RED}No dropdown parameter found for generation test${NC}"
    fi
    
    # Find a slider parameter for testing generation
    slider_param_id=$(curl -s $BASE_URL/parameters | jq -r '.[] | select(.type=="Slider") | .id' | head -1)
    if [ "$slider_param_id" != "" ]; then
      run_test "Generate fiction with slider" "curl -s -X POST $BASE_URL/generate -H 'Content-Type: application/json' -d '{\"selectedParameters\":{\"$slider_param_id\":500}}'"
    else
      echo -e "${RED}No slider parameter found for generation test${NC}"
    fi
    
    # Find a toggle parameter for testing generation
    toggle_param_id=$(curl -s $BASE_URL/parameters | jq -r '.[] | select(.type=="Toggle") | .id' | head -1)
    if [ "$toggle_param_id" != "" ]; then
      run_test "Generate fiction with toggle" "curl -s -X POST $BASE_URL/generate -H 'Content-Type: application/json' -d '{\"selectedParameters\":{\"$toggle_param_id\":true}}'"
    else
      echo -e "${RED}No toggle parameter found for generation test${NC}"
    fi
    
    # Generate fiction with multiple parameters
    params_object="{}"
    if [ "$dropdown_param_id" != "" ] && [ "$slider_param_id" != "" ] && [ "$toggle_param_id" != "" ]; then
      params_object="{\"$dropdown_param_id\":\"$dropdown_value_id\",\"$slider_param_id\":500,\"$toggle_param_id\":true}"
      run_test "Generate fiction with multiple parameters" "curl -s -X POST $BASE_URL/generate -H 'Content-Type: application/json' -d '{\"selectedParameters\":$params_object}'"
    fi
    
    # Test Parameter Deletion
    echo -e "\n${YELLOW}=== Parameter Deletion Tests ===${NC}"
    
    # Get the latest parameter (not param-1 which is the original)
    last_param_id=$(curl -s $BASE_URL/parameters | jq -r '.[] | select(.id != "param-1") | .id' | head -1)
    if [ "$last_param_id" != "null" ] && [ "$last_param_id" != "" ]; then
      run_test "Delete a parameter" "curl -s -X DELETE $BASE_URL/parameters/$last_param_id"
    else
      echo -e "${RED}No parameter found to delete${NC}"
      
      # Create a parameter just to delete it
      tmp_param_id=$(curl -s -X POST $BASE_URL/parameters -H 'Content-Type: application/json' -d '{
        "name": "Temporary Parameter",
        "type": "Dropdown",
        "visibility": "Basic",
        "categoryId": "'$first_category_id'",
        "values": [{"id": "tmp-1", "label": "Temp 1"}, {"id": "tmp-2", "label": "Temp 2"}]
      }' | jq -r '.id')
      
      if [ "$tmp_param_id" != "null" ] && [ "$tmp_param_id" != "" ]; then
        run_test "Delete a newly created parameter" "curl -s -X DELETE $BASE_URL/parameters/$tmp_param_id"
      fi
    fi
  else
    echo -e "${RED}No parameters found to test ID-specific endpoints${NC}"
  fi
  
  # Test Category Deletion
  echo -e "\n${YELLOW}=== Category Deletion Tests ===${NC}"
  
  # Create a category for deletion (using explicit JSON and proper escaping)
  delete_cat_response=$(curl -s -X POST $BASE_URL/categories -H "Content-Type: application/json" -d '{"name":"Category to Delete","visibility":"Show"}')
  delete_category_id=$(echo "$delete_cat_response" | jq -r '.id')
  
  if [ "$delete_category_id" != "null" ] && [ "$delete_category_id" != "" ]; then
    run_test "Delete a category" "curl -s -X DELETE $BASE_URL/categories/$delete_category_id"
    
    # Try to delete the main category with parameters (should fail)
    run_test "Delete a category with parameters (should fail)" "curl -s -X DELETE $BASE_URL/categories/$first_category_id"
  else
    echo -e "${RED}Could not create category for deletion test${NC}"
    echo "Response: $delete_cat_response"
    
    # Try to get and delete a category that's not the first one
    other_cat_id=$(curl -s $BASE_URL/categories | jq -r '.[] | select(.id != "'$first_category_id'") | .id' | head -1)
    if [ "$other_cat_id" != "" ]; then
      run_test "Delete another existing category" "curl -s -X DELETE $BASE_URL/categories/$other_cat_id"
    fi
  fi
else
  echo -e "${RED}No categories found for parameter tests${NC}"
fi

echo -e "\n${GREEN}==== SpecGen API Tests Completed ====${NC}"