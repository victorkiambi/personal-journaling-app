#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BLUE='\033[0;34m'

# Base URL
API_URL="http://localhost:3000/api/v1"

# Function to make API requests
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4
    
    if [ -n "$token" ]; then
        if [ -n "$data" ]; then
            curl -s -X "$method" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $token" \
                -d "$data" \
                "$API_URL$endpoint"
        else
            curl -s -X "$method" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $token" \
                "$API_URL$endpoint"
        fi
    else
        if [ -n "$data" ]; then
            curl -s -X "$method" \
                -H "Content-Type: application/json" \
                -d "$data" \
                "$API_URL$endpoint"
        else
            curl -s -X "$method" \
                -H "Content-Type: application/json" \
                "$API_URL$endpoint"
        fi
    fi
}

echo -e "${BLUE}Testing API Endpoints${NC}\n"

# Test 1: Register a new user
echo -e "${BLUE}1. Testing User Registration${NC}"
register_response=$(make_request "POST" "/auth/register" '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
}')
echo $register_response | jq '.'
echo

# Test 2: Login
echo -e "${BLUE}2. Testing Login${NC}"
login_response=$(make_request "POST" "/auth/login" '{
    "email": "john@example.com",
    "password": "password123"
}')
echo $login_response | jq '.'
token=$(echo $login_response | jq -r '.data.token')
echo

# Test 3: Get Categories
echo -e "${BLUE}3. Testing Get Categories${NC}"
categories_response=$(make_request "GET" "/categories" "" "$token")
echo $categories_response | jq '.'
echo

# Test 4: Create a new category
echo -e "${BLUE}4. Testing Create Category${NC}"
category_response=$(make_request "POST" "/categories" '{
    "name": "Goals",
    "color": "#FFD700",
    "description": "Personal and professional goals"
}' "$token")
echo $category_response | jq '.'
category_id=$(echo $category_response | jq -r '.data.id')
echo

# Test 5: Create a journal entry
echo -e "${BLUE}5. Testing Create Journal Entry${NC}"
entry_response=$(make_request "POST" "/entries" '{
    "title": "My Goals for 2024",
    "content": "1. Learn a new programming language\n2. Run a marathon\n3. Read 24 books",
    "isPublic": false,
    "categoryIds": ["'$category_id'"]
}' "$token")
echo $entry_response | jq '.'
entry_id=$(echo $entry_response | jq -r '.data.id')
echo

# Test 6: Get journal entries
echo -e "${BLUE}6. Testing Get Journal Entries${NC}"
entries_response=$(make_request "GET" "/entries" "" "$token")
echo $entries_response | jq '.'
echo

# Test 7: Get single journal entry
echo -e "${BLUE}7. Testing Get Single Journal Entry${NC}"
single_entry_response=$(make_request "GET" "/entries/$entry_id" "" "$token")
echo $single_entry_response | jq '.'
echo

# Test 8: Update journal entry
echo -e "${BLUE}8. Testing Update Journal Entry${NC}"
update_entry_response=$(make_request "PUT" "/entries/$entry_id" '{
    "title": "Updated: My Goals for 2024",
    "content": "1. Learn a new programming language\n2. Run a marathon\n3. Read 24 books\n4. Travel to Japan"
}' "$token")
echo $update_entry_response | jq '.'
echo

# Test 9: Get entries with filters
echo -e "${BLUE}9. Testing Get Entries with Filters${NC}"
filtered_entries_response=$(make_request "GET" "/entries?categoryId=$category_id&page=1&pageSize=10" "" "$token")
echo $filtered_entries_response | jq '.'
echo

# Test 10: Delete journal entry
echo -e "${BLUE}10. Testing Delete Journal Entry${NC}"
delete_entry_response=$(make_request "DELETE" "/entries/$entry_id" "" "$token")
echo $delete_entry_response | jq '.'
echo

echo -e "${GREEN}API Testing Complete!${NC}" 