#!/bin/bash

# Admin User Management API Testing Script
# Usage: ./test-admin-api.sh <admin_token> <user_id>

ADMIN_TOKEN=${1:-"your_admin_token_here"}
USER_ID=${2:-"5"}
BASE_URL="http://localhost:3001/api/admin"

echo "=== Admin User Management API Tests ==="
echo "Token: $ADMIN_TOKEN"
echo "Base URL: $BASE_URL"
echo ""

# Test 1: List Users
echo "1. List Users"
curl -s -X GET "$BASE_URL/users?page=1&pageSize=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" | jq . || echo "Failed"
echo ""

# Test 2: Search Users
echo "2. Search Users by Email"
curl -s -X GET "$BASE_URL/users?search=john&page=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" | jq . || echo "Failed"
echo ""

# Test 3: Filter by Role
echo "3. Filter Users by Role (CANDIDATE)"
curl -s -X GET "$BASE_URL/users?role=CANDIDATE&page=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" | jq . || echo "Failed"
echo ""

# Test 4: Filter by Status
echo "4. Filter Users by Status (ACTIVE)"
curl -s -X GET "$BASE_URL/users?status=ACTIVE&page=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" | jq . || echo "Failed"
echo ""

# Test 5: Lock User
echo "5. Lock User $USER_ID"
curl -s -X POST "$BASE_URL/users/$USER_ID/lock" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Testing lock functionality"}' | jq . || echo "Failed"
echo ""

# Test 6: Get User Audit Logs
echo "6. Get Audit Logs for User $USER_ID"
curl -s -X GET "$BASE_URL/users/$USER_ID/audit-logs" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" | jq . || echo "Failed"
echo ""

# Test 7: Unlock User
echo "7. Unlock User $USER_ID"
curl -s -X POST "$BASE_URL/users/$USER_ID/unlock" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Appeal accepted"}' | jq . || echo "Failed"
echo ""

# Test 8: Update User Role
echo "8. Update User $USER_ID Role to EMPLOYER"
curl -s -X PATCH "$BASE_URL/users/$USER_ID/role" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"EMPLOYER"}' | jq . || echo "Failed"
echo ""

# Test 9: Get All Audit Logs
echo "9. Get All Audit Logs"
curl -s -X GET "$BASE_URL/audit-logs?limit=10&offset=0" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" | jq . || echo "Failed"
echo ""

# Test 10: Soft Delete User
echo "10. Soft Delete User $USER_ID"
curl -s -X DELETE "$BASE_URL/users/$USER_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Duplicate account"}' | jq . || echo "Failed"
echo ""

echo "=== Tests Complete ==="
