"""
Test suite for Branch Auto-Assignment Feature
Tests:
1. GET /api/nearest-branch - returns nearest branch based on GPS coordinates
2. POST /api/orders with branch_id=null and user_latitude/user_longitude - auto-assigns nearest branch
3. POST /api/orders with explicit branch_id - still works as expected
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test data - Two branches in Hubballi
# Branch 1: 'Al Taj Family Restaurant - Old Hubli' (lat: 15.3647, lon: 75.124)
# Branch 2: 'Al Taj Restaurant & Fast Food - Shirur Park' (lat: 15.3486, lon: 75.1348)
OLD_HUBLI_BRANCH_ID = "ff0061fe-8e0c-4a6f-b44c-522597e9e959"
SHIRUR_PARK_BRANCH_ID = "c2d594c8-f358-4b0c-8aea-6bbe800b2340"

# Coordinates closer to Old Hubli branch
COORDS_NEAR_OLD_HUBLI = {"latitude": 15.36, "longitude": 75.13}

# Coordinates closer to Shirur Park branch
COORDS_NEAR_SHIRUR_PARK = {"latitude": 15.35, "longitude": 75.14}


class TestNearestBranchEndpoint:
    """Tests for GET /api/nearest-branch endpoint"""
    
    def test_nearest_branch_returns_old_hubli(self):
        """Test nearest branch returns Old Hubli branch for coordinates near it"""
        response = requests.get(
            f"{BASE_URL}/api/nearest-branch",
            params={"latitude": 15.36, "longitude": 75.13}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "branch" in data, "Response should contain 'branch' key"
        assert "distance_km" in data, "Response should contain 'distance_km' key"
        
        branch = data["branch"]
        assert branch["id"] == OLD_HUBLI_BRANCH_ID, f"Expected Old Hubli branch, got {branch.get('name')}"
        print(f"PASS: Nearest branch for (15.36, 75.13) is {branch['name']} at {data['distance_km']} km")
    
    def test_nearest_branch_returns_shirur_park(self):
        """Test nearest branch returns Shirur Park branch for coordinates near it"""
        response = requests.get(
            f"{BASE_URL}/api/nearest-branch",
            params={"latitude": 15.35, "longitude": 75.14}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        branch = data["branch"]
        assert branch["id"] == SHIRUR_PARK_BRANCH_ID, f"Expected Shirur Park branch, got {branch.get('name')}"
        print(f"PASS: Nearest branch for (15.35, 75.14) is {branch['name']} at {data['distance_km']} km")
    
    def test_nearest_branch_requires_coordinates(self):
        """Test that coordinates are required"""
        # Missing both
        response = requests.get(f"{BASE_URL}/api/nearest-branch")
        assert response.status_code == 422, "Should require latitude and longitude parameters"
        
        # Missing longitude
        response = requests.get(f"{BASE_URL}/api/nearest-branch", params={"latitude": 15.36})
        assert response.status_code == 422, "Should require longitude parameter"
        
        # Missing latitude
        response = requests.get(f"{BASE_URL}/api/nearest-branch", params={"longitude": 75.13})
        assert response.status_code == 422, "Should require latitude parameter"
        
        print("PASS: Coordinates are required for nearest-branch endpoint")
    
    def test_nearest_branch_returns_distance(self):
        """Test that response includes distance in km"""
        response = requests.get(
            f"{BASE_URL}/api/nearest-branch",
            params={"latitude": 15.36, "longitude": 75.13}
        )
        
        data = response.json()
        assert isinstance(data["distance_km"], (int, float)), "distance_km should be numeric"
        assert data["distance_km"] >= 0, "distance_km should be non-negative"
        print(f"PASS: Distance returned: {data['distance_km']} km")


class TestOrderAutoAssignment:
    """Tests for POST /api/orders with auto-assignment"""
    
    def get_menu_items(self, branch_id):
        """Helper to get menu items for a branch"""
        response = requests.get(f"{BASE_URL}/api/menu/items", params={"branch_id": branch_id})
        return response.json()
    
    def create_order_items(self, menu_items):
        """Helper to create order items from menu items"""
        if len(menu_items) == 0:
            pytest.skip("No menu items available")
        item = menu_items[0]
        return [{
            "menu_item_id": item["id"],
            "menu_item_name": item["name"],
            "quantity": 1,
            "unit_price": item["base_price"],
            "total_price": item["base_price"]
        }]
    
    def test_order_with_explicit_branch_id(self):
        """Test that POST /api/orders with explicit branch_id works"""
        menu_items = self.get_menu_items(OLD_HUBLI_BRANCH_ID)
        order_items = self.create_order_items(menu_items)
        
        order_data = {
            "customer_name": "TEST_Auto_Assignment_User",
            "customer_phone": "+919876543210",
            "branch_id": OLD_HUBLI_BRANCH_ID,
            "order_type": "takeaway",
            "items": order_items,
            "payment_method": "cod"
        }
        
        response = requests.post(f"{BASE_URL}/api/orders", json=order_data)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        order = response.json()
        assert order["branch_id"] == OLD_HUBLI_BRANCH_ID, "Branch ID should match the provided one"
        print(f"PASS: Order created with explicit branch_id: {order['order_number']}")
    
    def test_order_auto_assigns_nearest_branch_old_hubli(self):
        """Test that POST /api/orders with null branch_id auto-assigns Old Hubli branch"""
        menu_items = self.get_menu_items(OLD_HUBLI_BRANCH_ID)
        order_items = self.create_order_items(menu_items)
        
        order_data = {
            "customer_name": "TEST_Auto_Near_Old_Hubli",
            "customer_phone": "+919876543211",
            "branch_id": None,  # No branch specified
            "order_type": "takeaway",
            "items": order_items,
            "payment_method": "cod",
            "user_latitude": 15.36,
            "user_longitude": 75.13
        }
        
        response = requests.post(f"{BASE_URL}/api/orders", json=order_data)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        order = response.json()
        assert order["branch_id"] == OLD_HUBLI_BRANCH_ID, f"Expected Old Hubli branch, got {order['branch_id']}"
        print(f"PASS: Order auto-assigned to Old Hubli branch: {order['order_number']}")
    
    def test_order_auto_assigns_nearest_branch_shirur_park(self):
        """Test that POST /api/orders with null branch_id auto-assigns Shirur Park branch"""
        menu_items = self.get_menu_items(SHIRUR_PARK_BRANCH_ID)
        order_items = self.create_order_items(menu_items)
        
        order_data = {
            "customer_name": "TEST_Auto_Near_Shirur_Park",
            "customer_phone": "+919876543212",
            "branch_id": None,  # No branch specified
            "order_type": "takeaway",
            "items": order_items,
            "payment_method": "cod",
            "user_latitude": 15.35,
            "user_longitude": 75.14
        }
        
        response = requests.post(f"{BASE_URL}/api/orders", json=order_data)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        order = response.json()
        assert order["branch_id"] == SHIRUR_PARK_BRANCH_ID, f"Expected Shirur Park branch, got {order['branch_id']}"
        print(f"PASS: Order auto-assigned to Shirur Park branch: {order['order_number']}")
    
    def test_order_fallback_when_no_coordinates(self):
        """Test that order creation works even without coordinates (fallback to first active branch)"""
        menu_items = self.get_menu_items(OLD_HUBLI_BRANCH_ID)
        order_items = self.create_order_items(menu_items)
        
        order_data = {
            "customer_name": "TEST_Fallback_No_Coords",
            "customer_phone": "+919876543213",
            "branch_id": None,  # No branch specified
            "order_type": "takeaway",
            "items": order_items,
            "payment_method": "cod"
            # No user_latitude/user_longitude
        }
        
        response = requests.post(f"{BASE_URL}/api/orders", json=order_data)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        order = response.json()
        assert order["branch_id"] is not None, "Branch should be assigned via fallback"
        print(f"PASS: Order created with fallback branch: {order['branch_id']}, Order: {order['order_number']}")


class TestBranchesEndpoint:
    """Verify existing /api/branches endpoint still works"""
    
    def test_branches_list(self):
        """Test GET /api/branches returns both branches"""
        response = requests.get(f"{BASE_URL}/api/branches", params={"is_active": True})
        
        assert response.status_code == 200
        branches = response.json()
        
        assert len(branches) >= 2, f"Expected at least 2 branches, got {len(branches)}"
        
        branch_ids = [b["id"] for b in branches]
        assert OLD_HUBLI_BRANCH_ID in branch_ids, "Old Hubli branch should be in list"
        assert SHIRUR_PARK_BRANCH_ID in branch_ids, "Shirur Park branch should be in list"
        
        print(f"PASS: Branches endpoint returns {len(branches)} branches")


class TestMenuItemsWithBranch:
    """Test menu items load correctly with branch_id"""
    
    def test_menu_items_for_old_hubli(self):
        """Test menu items load for Old Hubli branch"""
        response = requests.get(f"{BASE_URL}/api/menu/items", params={"branch_id": OLD_HUBLI_BRANCH_ID})
        
        assert response.status_code == 200
        items = response.json()
        assert len(items) > 0, "Should have menu items for Old Hubli branch"
        print(f"PASS: Old Hubli branch has {len(items)} menu items")
    
    def test_menu_items_for_shirur_park(self):
        """Test menu items load for Shirur Park branch"""
        response = requests.get(f"{BASE_URL}/api/menu/items", params={"branch_id": SHIRUR_PARK_BRANCH_ID})
        
        assert response.status_code == 200
        items = response.json()
        assert len(items) > 0, "Should have menu items for Shirur Park branch"
        print(f"PASS: Shirur Park branch has {len(items)} menu items")
    
    def test_menu_categories(self):
        """Test menu categories endpoint"""
        response = requests.get(f"{BASE_URL}/api/menu/categories")
        
        assert response.status_code == 200
        categories = response.json()
        assert len(categories) > 0, "Should have menu categories"
        print(f"PASS: {len(categories)} menu categories available")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
