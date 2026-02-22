"""
Test Menu Item Images Feature - Product Image Management
Tests the new image management APIs:
- GET /api/menu/items/all (admin only)
- PATCH /api/menu/items/{item_id}/image
- PATCH /api/menu/items/bulk-images
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://altaj-preview.preview.emergentagent.com').rstrip('/')

class TestMenuItemImages:
    """Menu Item Image Management Tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - login as admin to get token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@altaj.com",
            "password": "admin123"
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        self.token = data.get("access_token")
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        yield
    
    def test_get_all_menu_items_admin_only(self):
        """Test GET /api/menu/items/all requires admin auth"""
        # Test without auth - should fail (403 for role check or 401 for no auth)
        response = requests.get(f"{BASE_URL}/api/menu/items/all")
        assert response.status_code in [401, 403], "Should require authentication"
        
        # Test with admin auth - should succeed
        response = requests.get(f"{BASE_URL}/api/menu/items/all", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 183, f"Expected 183 items, got {len(data)}"
        
        # Verify all items have image_url field
        items_with_images = [item for item in data if item.get("image_url")]
        assert len(items_with_images) == 183, f"Expected all 183 items to have images, got {len(items_with_images)}"
        print(f"✓ All 183 menu items have image_url field")
    
    def test_menu_items_have_image_urls(self):
        """Verify all menu items were seeded with valid image URLs"""
        response = requests.get(f"{BASE_URL}/api/menu/items/all", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        
        # Check that image URLs are valid Pexels/Unsplash URLs
        for item in data:
            image_url = item.get("image_url", "")
            assert image_url, f"Item '{item['name']}' missing image_url"
            assert "images.pexels.com" in image_url or "images.unsplash.com" in image_url, \
                f"Item '{item['name']}' has invalid image URL: {image_url[:50]}"
        
        print(f"✓ All {len(data)} items have valid Pexels/Unsplash image URLs")
    
    def test_update_menu_item_image(self):
        """Test PATCH /api/menu/items/{item_id}/image"""
        # Get first menu item
        response = requests.get(f"{BASE_URL}/api/menu/items/all", headers=self.headers)
        assert response.status_code == 200
        
        items = response.json()
        test_item = items[0]
        item_id = test_item["id"]
        original_url = test_item.get("image_url", "")
        
        # Update image URL
        new_url = "https://images.pexels.com/photos/99999999/test-update.jpeg"
        response = requests.patch(
            f"{BASE_URL}/api/menu/items/{item_id}/image",
            headers=self.headers,
            json={"image_url": new_url}
        )
        assert response.status_code == 200, f"Update failed: {response.text}"
        
        data = response.json()
        assert data["message"] == "Image updated"
        assert data["item_id"] == item_id
        assert data["image_url"] == new_url
        
        # Verify persistence - GET the item and check URL
        response = requests.get(f"{BASE_URL}/api/menu/items/all", headers=self.headers)
        updated_items = response.json()
        updated_item = next(i for i in updated_items if i["id"] == item_id)
        assert updated_item["image_url"] == new_url, "Image URL not persisted"
        
        # Restore original URL
        requests.patch(
            f"{BASE_URL}/api/menu/items/{item_id}/image",
            headers=self.headers,
            json={"image_url": original_url}
        )
        print(f"✓ Image URL update and persistence verified for item '{test_item['name']}'")
    
    def test_update_image_requires_auth(self):
        """Test PATCH /api/menu/items/{item_id}/image requires admin auth"""
        # Get first menu item ID
        response = requests.get(f"{BASE_URL}/api/menu/items/all", headers=self.headers)
        items = response.json()
        item_id = items[0]["id"]
        
        # Try to update without auth (403 for role check or 401 for no auth)
        response = requests.patch(
            f"{BASE_URL}/api/menu/items/{item_id}/image",
            json={"image_url": "https://example.com/test.jpg"}
        )
        assert response.status_code in [401, 403], "Should require authentication"
        print("✓ Image update correctly requires authentication")
    
    def test_update_nonexistent_item_returns_404(self):
        """Test PATCH with invalid item_id returns 404"""
        fake_id = str(uuid.uuid4())
        response = requests.patch(
            f"{BASE_URL}/api/menu/items/{fake_id}/image",
            headers=self.headers,
            json={"image_url": "https://example.com/test.jpg"}
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Non-existent item correctly returns 404")
    
    def test_bulk_update_images(self):
        """Test PATCH /api/menu/items/bulk-images"""
        # Get first 2 menu items
        response = requests.get(f"{BASE_URL}/api/menu/items/all", headers=self.headers)
        items = response.json()[:2]
        
        # Store original URLs for restore
        original_urls = {item["id"]: item.get("image_url", "") for item in items}
        
        # Prepare bulk update
        bulk_updates = {
            "updates": [
                {"item_id": items[0]["id"], "image_url": "https://images.pexels.com/photos/bulk1.jpeg"},
                {"item_id": items[1]["id"], "image_url": "https://images.pexels.com/photos/bulk2.jpeg"}
            ]
        }
        
        response = requests.patch(
            f"{BASE_URL}/api/menu/items/bulk-images",
            headers=self.headers,
            json=bulk_updates
        )
        assert response.status_code == 200, f"Bulk update failed: {response.text}"
        
        data = response.json()
        assert "Updated 2" in data["message"], f"Expected 2 updates, got: {data['message']}"
        
        # Restore original URLs
        for item_id, original_url in original_urls.items():
            requests.patch(
                f"{BASE_URL}/api/menu/items/{item_id}/image",
                headers=self.headers,
                json={"image_url": original_url}
            )
        
        print("✓ Bulk image update working correctly")
    
    def test_menu_categories_exist(self):
        """Verify menu categories API returns all categories"""
        response = requests.get(f"{BASE_URL}/api/menu/categories")
        assert response.status_code == 200
        
        categories = response.json()
        assert len(categories) >= 13, f"Expected at least 13 categories, got {len(categories)}"
        
        # Check for key categories
        category_names = [cat["name"] for cat in categories]
        required_categories = ["Combos", "Chinese Thrillers", "Tandoori Karishma", "Biryani & Rice"]
        for cat in required_categories:
            assert cat in category_names, f"Missing category: {cat}"
        
        print(f"✓ Found {len(categories)} menu categories including all required ones")
    
    def test_public_menu_shows_images(self):
        """Verify public menu endpoint shows items with images"""
        response = requests.get(f"{BASE_URL}/api/menu/items")
        assert response.status_code == 200
        
        items = response.json()
        # Count items with images
        items_with_images = [item for item in items if item.get("image_url")]
        
        # Should show items (may be limited by availability)
        assert len(items) > 0, "No menu items returned"
        print(f"✓ Public menu shows {len(items)} items, {len(items_with_images)} have images")


class TestExistingAdminTabs:
    """Verify all existing admin tabs still work"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - login as admin"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@altaj.com",
            "password": "admin123"
        })
        assert response.status_code == 200
        self.token = response.json().get("access_token")
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
    
    def test_branches_endpoint(self):
        """Test branches API for Dashboard and Branches tabs"""
        response = requests.get(f"{BASE_URL}/api/branches", headers=self.headers)
        assert response.status_code == 200
        
        branches = response.json()
        assert len(branches) >= 2, "Expected at least 2 branches"
        print(f"✓ Branches API working - {len(branches)} branches")
    
    def test_staff_endpoint(self):
        """Test staff API for Staff tab"""
        response = requests.get(f"{BASE_URL}/api/users", headers=self.headers)
        assert response.status_code == 200
        
        staff = response.json()
        assert len(staff) > 0, "Expected staff members"
        print(f"✓ Staff API working - {len(staff)} users")
    
    def test_orders_endpoint(self):
        """Test orders API for Orders tab"""
        response = requests.get(f"{BASE_URL}/api/orders", headers=self.headers)
        assert response.status_code == 200
        
        orders = response.json()
        print(f"✓ Orders API working - {len(orders)} orders")
    
    def test_coupons_endpoint(self):
        """Test coupons API for Coupons tab"""
        response = requests.get(f"{BASE_URL}/api/coupons", headers=self.headers)
        assert response.status_code == 200
        
        coupons = response.json()
        print(f"✓ Coupons API working - {len(coupons)} coupons")
    
    def test_reviews_endpoint(self):
        """Test reviews API for Reviews tab"""
        response = requests.get(f"{BASE_URL}/api/reviews", headers=self.headers)
        assert response.status_code == 200
        print("✓ Reviews API working")
    
    def test_reports_endpoint(self):
        """Test performance report for Reports tab"""
        response = requests.get(f"{BASE_URL}/api/reports/branch-performance", headers=self.headers)
        assert response.status_code == 200
        
        performance = response.json()
        assert len(performance) > 0, "Expected performance data"
        print(f"✓ Reports API working - {len(performance)} branch reports")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
