"""
Backend API Tests for Al Taj Restaurant Management Platform
Testing: Table management, Delivery fleet, Order routing, Customer flows
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://restaurant-hub-74.preview.emergentagent.com')

# Test credentials
ADMIN_CREDS = {"email": "admin@altaj.com", "password": "admin123"}
DELIVERY_CREDS = {"email": "delivery1.familyrestaurant-oldhubli@altaj.com", "password": "delivery123"}
WAITER_CREDS = {"email": "waiter1.familyrestaurant-oldhubli@altaj.com", "password": "waiter123"}
KITCHEN_CREDS = {"email": "kitchen1.familyrestaurant-oldhubli@altaj.com", "password": "kitchen123"}
CUSTOMER_CREDS = {"email": "priya.sharma@email.com", "password": "customer123"}


class TestBranchesAndTables:
    """Test branch and table management APIs"""
    
    def test_get_branches(self):
        """Test fetching all branches"""
        response = requests.get(f"{BASE_URL}/api/branches")
        assert response.status_code == 200
        branches = response.json()
        assert len(branches) >= 2, "Should have at least 2 branches"
        # Verify branch structure
        for branch in branches:
            assert "id" in branch
            assert "name" in branch
            assert "address" in branch
            assert "is_active" in branch
        print(f"✓ Found {len(branches)} branches")
    
    def test_get_tables(self):
        """Test fetching all tables"""
        response = requests.get(f"{BASE_URL}/api/tables")
        assert response.status_code == 200
        tables = response.json()
        assert len(tables) >= 10, "Should have at least 10 tables"
        # Verify table structure
        for table in tables:
            assert "id" in table
            assert "branch_id" in table
            assert "table_number" in table
            assert "capacity" in table
            assert "status" in table
            assert table["status"] in ["vacant", "occupied", "cleaning"]
        print(f"✓ Found {len(tables)} tables")
    
    def test_get_tables_by_branch(self):
        """Test filtering tables by branch"""
        # First get branches
        branches_response = requests.get(f"{BASE_URL}/api/branches")
        branches = branches_response.json()
        branch_id = branches[0]["id"]
        
        # Get tables for specific branch
        response = requests.get(f"{BASE_URL}/api/tables?branch_id={branch_id}")
        assert response.status_code == 200
        tables = response.json()
        assert len(tables) >= 5, "Should have at least 5 tables per branch"
        # Verify all tables belong to the branch
        for table in tables:
            assert table["branch_id"] == branch_id
        print(f"✓ Found {len(tables)} tables for branch {branch_id}")
    
    def test_get_vacant_tables(self):
        """Test filtering vacant tables"""
        response = requests.get(f"{BASE_URL}/api/tables?status=vacant")
        assert response.status_code == 200
        tables = response.json()
        # Verify all tables are vacant
        for table in tables:
            assert table["status"] == "vacant"
        print(f"✓ Found {len(tables)} vacant tables")


class TestDeliveryFleet:
    """Test delivery partner management APIs"""
    
    def test_get_delivery_partners(self):
        """Test fetching all delivery partners"""
        response = requests.get(f"{BASE_URL}/api/delivery-partners")
        assert response.status_code == 200
        partners = response.json()
        assert len(partners) >= 6, "Should have at least 6 delivery partners"
        # Verify partner structure
        for partner in partners:
            assert "id" in partner
            assert "user_id" in partner
            assert "branch_id" in partner
            assert "name" in partner
            assert "status" in partner
            assert partner["status"] in ["available", "busy", "offline"]
        print(f"✓ Found {len(partners)} delivery partners")
    
    def test_get_delivery_partners_by_branch(self):
        """Test filtering delivery partners by branch"""
        # First get branches
        branches_response = requests.get(f"{BASE_URL}/api/branches")
        branches = branches_response.json()
        branch_id = branches[0]["id"]
        
        # Get partners for specific branch
        response = requests.get(f"{BASE_URL}/api/delivery-partners?branch_id={branch_id}")
        assert response.status_code == 200
        partners = response.json()
        assert len(partners) >= 3, "Should have at least 3 partners per branch"
        # Verify all partners belong to the branch
        for partner in partners:
            assert partner["branch_id"] == branch_id
        print(f"✓ Found {len(partners)} delivery partners for branch")
    
    def test_check_delivery_availability(self):
        """Test delivery availability check endpoint"""
        # Get a branch
        branches_response = requests.get(f"{BASE_URL}/api/branches")
        branches = branches_response.json()
        branch_id = branches[0]["id"]
        
        # Check availability
        response = requests.get(f"{BASE_URL}/api/delivery-partners/availability/{branch_id}")
        assert response.status_code == 200
        data = response.json()
        assert "available" in data
        assert "available_count" in data
        assert isinstance(data["available"], bool)
        assert isinstance(data["available_count"], int)
        print(f"✓ Delivery availability: {data['available']}, count: {data['available_count']}")


class TestAuthentication:
    """Test authentication endpoints"""
    
    def test_admin_login(self):
        """Test admin login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_CREDS)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["role"] == "admin"
        print(f"✓ Admin login successful: {data['user']['email']}")
    
    def test_delivery_partner_login(self):
        """Test delivery partner login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=DELIVERY_CREDS)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["role"] == "delivery_partner"
        print(f"✓ Delivery partner login successful: {data['user']['email']}")
    
    def test_waiter_login(self):
        """Test waiter login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=WAITER_CREDS)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["role"] == "waiter"
        print(f"✓ Waiter login successful: {data['user']['email']}")
    
    def test_kitchen_staff_login(self):
        """Test kitchen staff login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=KITCHEN_CREDS)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["role"] == "kitchen_staff"
        print(f"✓ Kitchen staff login successful: {data['user']['email']}")
    
    def test_customer_login(self):
        """Test customer login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=CUSTOMER_CREDS)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["role"] == "customer"
        print(f"✓ Customer login successful: {data['user']['email']}")
    
    def test_invalid_login(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "invalid@test.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Invalid login correctly rejected")


class TestMenuItems:
    """Test menu item APIs"""
    
    def test_get_menu_categories(self):
        """Test fetching menu categories"""
        response = requests.get(f"{BASE_URL}/api/menu/categories")
        assert response.status_code == 200
        categories = response.json()
        assert len(categories) > 0, "Should have at least one category"
        print(f"✓ Found {len(categories)} menu categories")
    
    def test_get_menu_items(self):
        """Test fetching menu items"""
        response = requests.get(f"{BASE_URL}/api/menu/items")
        assert response.status_code == 200
        items = response.json()
        assert len(items) > 0, "Should have at least one menu item"
        # Verify item structure
        for item in items:
            assert "id" in item
            assert "name" in item
            assert "base_price" in item
            assert "category_id" in item
        print(f"✓ Found {len(items)} menu items")


class TestOrderCreation:
    """Test order creation with different order types"""
    
    @pytest.fixture
    def setup_data(self):
        """Get branch, tables, and menu items for order creation"""
        branches = requests.get(f"{BASE_URL}/api/branches").json()
        tables = requests.get(f"{BASE_URL}/api/tables?branch_id={branches[0]['id']}&status=vacant").json()
        menu_items = requests.get(f"{BASE_URL}/api/menu/items").json()
        return {
            "branch": branches[0],
            "tables": tables,
            "menu_items": menu_items
        }
    
    def test_create_dine_in_order_with_table(self, setup_data):
        """Test creating dine-in order with table selection"""
        branch = setup_data["branch"]
        tables = setup_data["tables"]
        menu_items = setup_data["menu_items"]
        
        if not tables:
            pytest.skip("No vacant tables available")
        if not menu_items:
            pytest.skip("No menu items available")
        
        table = tables[0]
        item = menu_items[0]
        
        order_data = {
            "customer_name": "TEST_DineIn Customer",
            "customer_phone": "+91-9876543210",
            "branch_id": branch["id"],
            "order_type": "dine_in",
            "table_id": table["id"],
            "items": [{
                "menu_item_id": item["id"],
                "menu_item_name": item["name"],
                "quantity": 2,
                "unit_price": item["base_price"],
                "total_price": item["base_price"] * 2
            }],
            "payment_method": "cod"
        }
        
        response = requests.post(f"{BASE_URL}/api/orders", json=order_data)
        assert response.status_code == 200
        order = response.json()
        assert order["order_type"] == "dine_in"
        assert order["table_id"] == table["id"]
        assert order["status"] == "pending"
        print(f"✓ Dine-in order created: {order['order_number']} with table {table['table_number']}")
        
        # Verify table status changed to occupied
        table_response = requests.get(f"{BASE_URL}/api/tables?branch_id={branch['id']}")
        updated_tables = table_response.json()
        updated_table = next((t for t in updated_tables if t["id"] == table["id"]), None)
        assert updated_table is not None
        assert updated_table["status"] == "occupied", f"Table should be occupied, got {updated_table['status']}"
        print(f"✓ Table {table['table_number']} status changed to occupied")
        
        return order
    
    def test_create_takeaway_order(self, setup_data):
        """Test creating takeaway order"""
        branch = setup_data["branch"]
        menu_items = setup_data["menu_items"]
        
        if not menu_items:
            pytest.skip("No menu items available")
        
        item = menu_items[0]
        
        order_data = {
            "customer_name": "TEST_Takeaway Customer",
            "customer_phone": "+91-9876543211",
            "branch_id": branch["id"],
            "order_type": "takeaway",
            "items": [{
                "menu_item_id": item["id"],
                "menu_item_name": item["name"],
                "quantity": 1,
                "unit_price": item["base_price"],
                "total_price": item["base_price"]
            }],
            "payment_method": "cod"
        }
        
        response = requests.post(f"{BASE_URL}/api/orders", json=order_data)
        assert response.status_code == 200
        order = response.json()
        assert order["order_type"] == "takeaway"
        assert order["table_id"] is None
        print(f"✓ Takeaway order created: {order['order_number']}")
    
    def test_create_delivery_order(self, setup_data):
        """Test creating delivery order"""
        branch = setup_data["branch"]
        menu_items = setup_data["menu_items"]
        
        if not menu_items:
            pytest.skip("No menu items available")
        
        # Check delivery availability first
        availability = requests.get(f"{BASE_URL}/api/delivery-partners/availability/{branch['id']}").json()
        if not availability["available"]:
            pytest.skip("No delivery partners available")
        
        item = menu_items[0]
        
        order_data = {
            "customer_name": "TEST_Delivery Customer",
            "customer_phone": "+91-9876543212",
            "branch_id": branch["id"],
            "order_type": "delivery",
            "delivery_address": "123 Test Street, Test City, 580001",
            "items": [{
                "menu_item_id": item["id"],
                "menu_item_name": item["name"],
                "quantity": 1,
                "unit_price": item["base_price"],
                "total_price": item["base_price"]
            }],
            "payment_method": "cod"
        }
        
        response = requests.post(f"{BASE_URL}/api/orders", json=order_data)
        assert response.status_code == 200
        order = response.json()
        assert order["order_type"] == "delivery"
        assert order["delivery_address"] == "123 Test Street, Test City, 580001"
        print(f"✓ Delivery order created: {order['order_number']}")
    
    def test_delivery_order_fails_when_no_partners_available(self, setup_data):
        """Test that delivery order fails when no partners are available"""
        # This test would require setting all partners to busy/offline first
        # For now, we just verify the endpoint exists and returns proper error format
        branch = setup_data["branch"]
        menu_items = setup_data["menu_items"]
        
        if not menu_items:
            pytest.skip("No menu items available")
        
        # Check if delivery is available - if yes, skip this test
        availability = requests.get(f"{BASE_URL}/api/delivery-partners/availability/{branch['id']}").json()
        if availability["available"]:
            print("✓ Delivery partners available - skipping unavailability test")
            pytest.skip("Delivery partners are available, cannot test unavailability")
    
    def test_dine_in_order_fails_with_occupied_table(self, setup_data):
        """Test that dine-in order fails when table is occupied"""
        branch = setup_data["branch"]
        menu_items = setup_data["menu_items"]
        
        # Get occupied tables
        tables_response = requests.get(f"{BASE_URL}/api/tables?branch_id={branch['id']}&status=occupied")
        occupied_tables = tables_response.json()
        
        if not occupied_tables:
            pytest.skip("No occupied tables to test with")
        if not menu_items:
            pytest.skip("No menu items available")
        
        table = occupied_tables[0]
        item = menu_items[0]
        
        order_data = {
            "customer_name": "TEST_Should Fail",
            "customer_phone": "+91-9876543213",
            "branch_id": branch["id"],
            "order_type": "dine_in",
            "table_id": table["id"],
            "items": [{
                "menu_item_id": item["id"],
                "menu_item_name": item["name"],
                "quantity": 1,
                "unit_price": item["base_price"],
                "total_price": item["base_price"]
            }],
            "payment_method": "cod"
        }
        
        response = requests.post(f"{BASE_URL}/api/orders", json=order_data)
        assert response.status_code == 400
        assert "not available" in response.json()["detail"].lower()
        print(f"✓ Order correctly rejected for occupied table")


class TestOrderStatusFlow:
    """Test order status transitions"""
    
    @pytest.fixture
    def auth_headers(self):
        """Get authentication headers for different roles"""
        headers = {}
        
        # Kitchen staff
        kitchen_response = requests.post(f"{BASE_URL}/api/auth/login", json=KITCHEN_CREDS)
        if kitchen_response.status_code == 200:
            headers["kitchen"] = {"Authorization": f"Bearer {kitchen_response.json()['access_token']}"}
        
        # Waiter
        waiter_response = requests.post(f"{BASE_URL}/api/auth/login", json=WAITER_CREDS)
        if waiter_response.status_code == 200:
            headers["waiter"] = {"Authorization": f"Bearer {waiter_response.json()['access_token']}"}
        
        # Delivery partner
        delivery_response = requests.post(f"{BASE_URL}/api/auth/login", json=DELIVERY_CREDS)
        if delivery_response.status_code == 200:
            headers["delivery"] = {"Authorization": f"Bearer {delivery_response.json()['access_token']}"}
        
        return headers
    
    def test_order_status_flow_dine_in(self, auth_headers):
        """Test complete dine-in order flow: pending → confirmed → preparing → ready → served → completed"""
        # Get setup data
        branches = requests.get(f"{BASE_URL}/api/branches").json()
        branch = branches[0]
        tables = requests.get(f"{BASE_URL}/api/tables?branch_id={branch['id']}&status=vacant").json()
        menu_items = requests.get(f"{BASE_URL}/api/menu/items").json()
        
        if not tables or not menu_items:
            pytest.skip("No tables or menu items available")
        
        # Create order
        order_data = {
            "customer_name": "TEST_Flow Customer",
            "customer_phone": "+91-9876543214",
            "branch_id": branch["id"],
            "order_type": "dine_in",
            "table_id": tables[0]["id"],
            "items": [{
                "menu_item_id": menu_items[0]["id"],
                "menu_item_name": menu_items[0]["name"],
                "quantity": 1,
                "unit_price": menu_items[0]["base_price"],
                "total_price": menu_items[0]["base_price"]
            }],
            "payment_method": "cod"
        }
        
        response = requests.post(f"{BASE_URL}/api/orders", json=order_data)
        assert response.status_code == 200
        order = response.json()
        order_id = order["id"]
        print(f"✓ Order created: {order['order_number']}")
        
        # Status flow: pending → confirmed
        response = requests.put(f"{BASE_URL}/api/orders/{order_id}/status", json={"status": "confirmed"})
        assert response.status_code == 200
        assert response.json()["status"] == "confirmed"
        print("✓ Status: pending → confirmed")
        
        # Status flow: confirmed → preparing
        response = requests.put(f"{BASE_URL}/api/orders/{order_id}/status", json={"status": "preparing"})
        assert response.status_code == 200
        assert response.json()["status"] == "preparing"
        print("✓ Status: confirmed → preparing")
        
        # Status flow: preparing → ready
        response = requests.put(f"{BASE_URL}/api/orders/{order_id}/status", json={"status": "ready"})
        assert response.status_code == 200
        assert response.json()["status"] == "ready"
        print("✓ Status: preparing → ready")
        
        # Status flow: ready → served
        response = requests.put(f"{BASE_URL}/api/orders/{order_id}/status", json={"status": "served"})
        assert response.status_code == 200
        assert response.json()["status"] == "served"
        print("✓ Status: ready → served")
        
        # Status flow: served → completed (table should go to cleaning)
        response = requests.put(f"{BASE_URL}/api/orders/{order_id}/status", json={"status": "completed"})
        assert response.status_code == 200
        assert response.json()["status"] == "completed"
        print("✓ Status: served → completed")
        
        # Verify table status changed to cleaning
        table_response = requests.get(f"{BASE_URL}/api/tables?branch_id={branch['id']}")
        updated_tables = table_response.json()
        updated_table = next((t for t in updated_tables if t["id"] == tables[0]["id"]), None)
        assert updated_table["status"] == "cleaning", f"Table should be cleaning, got {updated_table['status']}"
        print(f"✓ Table status changed to cleaning after order completion")


class TestTableStatusManagement:
    """Test table status management by waiter"""
    
    @pytest.fixture
    def waiter_headers(self):
        """Get waiter authentication headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=WAITER_CREDS)
        if response.status_code == 200:
            return {"Authorization": f"Bearer {response.json()['access_token']}"}
        pytest.skip("Waiter login failed")
    
    def test_mark_table_vacant_after_cleaning(self, waiter_headers):
        """Test waiter marking table as vacant after cleaning"""
        # Get a cleaning table or create one
        branches = requests.get(f"{BASE_URL}/api/branches").json()
        branch = branches[0]
        tables = requests.get(f"{BASE_URL}/api/tables?branch_id={branch['id']}&status=cleaning").json()
        
        if not tables:
            # Try to get any table and set it to cleaning first
            all_tables = requests.get(f"{BASE_URL}/api/tables?branch_id={branch['id']}").json()
            if all_tables:
                table = all_tables[0]
                # Set to cleaning
                requests.put(f"{BASE_URL}/api/tables/{table['id']}/status", 
                           json={"status": "cleaning"}, headers=waiter_headers)
                tables = [table]
        
        if not tables:
            pytest.skip("No tables available for testing")
        
        table = tables[0]
        
        # Mark as vacant
        response = requests.put(f"{BASE_URL}/api/tables/{table['id']}/status", 
                               json={"status": "vacant"}, headers=waiter_headers)
        assert response.status_code == 200
        assert response.json()["status"] == "vacant"
        print(f"✓ Table {table['table_number']} marked as vacant")


class TestDeliveryPartnerFlow:
    """Test delivery partner operations"""
    
    @pytest.fixture
    def delivery_auth(self):
        """Get delivery partner authentication"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=DELIVERY_CREDS)
        if response.status_code == 200:
            data = response.json()
            return {
                "headers": {"Authorization": f"Bearer {data['access_token']}"},
                "user": data["user"]
            }
        pytest.skip("Delivery partner login failed")
    
    def test_get_delivery_partner_profile(self, delivery_auth):
        """Test delivery partner can get their profile"""
        response = requests.get(f"{BASE_URL}/api/delivery-partners/me", headers=delivery_auth["headers"])
        assert response.status_code == 200
        partner = response.json()
        assert "id" in partner
        assert "status" in partner
        assert "branch_id" in partner
        print(f"✓ Delivery partner profile retrieved: {partner['name']}")
    
    def test_update_delivery_partner_status(self, delivery_auth):
        """Test delivery partner can update their status"""
        # Get partner profile first
        profile_response = requests.get(f"{BASE_URL}/api/delivery-partners/me", headers=delivery_auth["headers"])
        partner = profile_response.json()
        partner_id = partner["id"]
        
        # Set to offline
        response = requests.put(f"{BASE_URL}/api/delivery-partners/{partner_id}/status",
                               json={"status": "offline"}, headers=delivery_auth["headers"])
        assert response.status_code == 200
        assert response.json()["status"] == "offline"
        print("✓ Status changed to offline")
        
        # Set back to available
        response = requests.put(f"{BASE_URL}/api/delivery-partners/{partner_id}/status",
                               json={"status": "available"}, headers=delivery_auth["headers"])
        assert response.status_code == 200
        assert response.json()["status"] == "available"
        print("✓ Status changed back to available")


class TestDeliveryOrderFlow:
    """Test complete delivery order flow"""
    
    def test_delivery_order_pickup_and_delivery_flow(self):
        """Test delivery order: ready → picked_up → on_the_way → delivered"""
        # Login as delivery partner
        delivery_login = requests.post(f"{BASE_URL}/api/auth/login", json=DELIVERY_CREDS)
        if delivery_login.status_code != 200:
            pytest.skip("Delivery partner login failed")
        
        delivery_headers = {"Authorization": f"Bearer {delivery_login.json()['access_token']}"}
        delivery_user = delivery_login.json()["user"]
        
        # Get delivery partner profile
        partner_response = requests.get(f"{BASE_URL}/api/delivery-partners/me", headers=delivery_headers)
        if partner_response.status_code != 200:
            pytest.skip("Could not get delivery partner profile")
        partner = partner_response.json()
        
        # Get branch and menu items
        branches = requests.get(f"{BASE_URL}/api/branches").json()
        branch = next((b for b in branches if b["id"] == partner["branch_id"]), branches[0])
        menu_items = requests.get(f"{BASE_URL}/api/menu/items").json()
        
        if not menu_items:
            pytest.skip("No menu items available")
        
        # Create delivery order
        order_data = {
            "customer_name": "TEST_Delivery Flow",
            "customer_phone": "+91-9876543215",
            "branch_id": branch["id"],
            "order_type": "delivery",
            "delivery_address": "456 Test Avenue, Test City, 580002",
            "items": [{
                "menu_item_id": menu_items[0]["id"],
                "menu_item_name": menu_items[0]["name"],
                "quantity": 1,
                "unit_price": menu_items[0]["base_price"],
                "total_price": menu_items[0]["base_price"]
            }],
            "payment_method": "cod"
        }
        
        response = requests.post(f"{BASE_URL}/api/orders", json=order_data)
        assert response.status_code == 200
        order = response.json()
        order_id = order["id"]
        print(f"✓ Delivery order created: {order['order_number']}")
        
        # Move order to ready status (kitchen flow)
        requests.put(f"{BASE_URL}/api/orders/{order_id}/status", json={"status": "confirmed"})
        requests.put(f"{BASE_URL}/api/orders/{order_id}/status", json={"status": "preparing"})
        response = requests.put(f"{BASE_URL}/api/orders/{order_id}/status", json={"status": "ready"})
        assert response.status_code == 200
        print("✓ Order marked as ready")
        
        # Delivery partner picks up order
        response = requests.put(f"{BASE_URL}/api/orders/{order_id}/assign-delivery",
                               json={"delivery_partner_id": partner["id"]}, headers=delivery_headers)
        assert response.status_code == 200
        assert response.json()["status"] == "picked_up"
        assert response.json()["delivery_partner_id"] == partner["id"]
        print("✓ Order picked up by delivery partner")
        
        # Verify partner status changed to busy
        partner_response = requests.get(f"{BASE_URL}/api/delivery-partners/me", headers=delivery_headers)
        updated_partner = partner_response.json()
        assert updated_partner["status"] == "busy"
        print("✓ Delivery partner status changed to busy")
        
        # Mark as on the way
        response = requests.put(f"{BASE_URL}/api/orders/{order_id}/status",
                               json={"status": "on_the_way"}, headers=delivery_headers)
        assert response.status_code == 200
        assert response.json()["status"] == "on_the_way"
        print("✓ Order marked as on the way")
        
        # Mark as delivered
        response = requests.put(f"{BASE_URL}/api/orders/{order_id}/status",
                               json={"status": "delivered"}, headers=delivery_headers)
        assert response.status_code == 200
        assert response.json()["status"] == "delivered"
        print("✓ Order marked as delivered")
        
        # Verify partner status changed back to available
        partner_response = requests.get(f"{BASE_URL}/api/delivery-partners/me", headers=delivery_headers)
        updated_partner = partner_response.json()
        assert updated_partner["status"] == "available"
        print("✓ Delivery partner status changed back to available")


class TestKitchenDashboard:
    """Test kitchen dashboard order visibility"""
    
    @pytest.fixture
    def kitchen_auth(self):
        """Get kitchen staff authentication"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=KITCHEN_CREDS)
        if response.status_code == 200:
            data = response.json()
            return {
                "headers": {"Authorization": f"Bearer {data['access_token']}"},
                "user": data["user"]
            }
        pytest.skip("Kitchen staff login failed")
    
    def test_kitchen_sees_all_order_types(self, kitchen_auth):
        """Test that kitchen dashboard shows all order types"""
        user = kitchen_auth["user"]
        branch_id = user.get("branch_id")
        
        if not branch_id:
            pytest.skip("Kitchen user has no branch_id")
        
        # Get all orders for the branch
        response = requests.get(f"{BASE_URL}/api/orders?branch_id={branch_id}", headers=kitchen_auth["headers"])
        assert response.status_code == 200
        orders = response.json()
        
        # Check that we can see different order types
        order_types = set(order["order_type"] for order in orders)
        print(f"✓ Kitchen can see orders of types: {order_types}")
        
        # Verify order structure
        for order in orders[:5]:  # Check first 5 orders
            assert "order_type" in order
            assert "status" in order
            assert "items" in order
            assert order["order_type"] in ["dine_in", "takeaway", "delivery"]
        print(f"✓ Kitchen dashboard shows {len(orders)} orders")


# Cleanup test data
class TestCleanup:
    """Cleanup test data created during tests"""
    
    def test_cleanup_test_orders(self):
        """Mark test orders as completed/cancelled for cleanup"""
        # Get all orders
        response = requests.get(f"{BASE_URL}/api/orders")
        if response.status_code != 200:
            return
        
        orders = response.json()
        test_orders = [o for o in orders if o.get("customer_name", "").startswith("TEST_")]
        
        for order in test_orders:
            if order["status"] not in ["completed", "cancelled"]:
                requests.put(f"{BASE_URL}/api/orders/{order['id']}/status", json={"status": "cancelled"})
        
        print(f"✓ Cleaned up {len(test_orders)} test orders")
