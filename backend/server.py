from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Create the main app
app = FastAPI(title="Al Taj Restaurant Multi-Branch System")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_token(token)
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def require_role(allowed_roles: List[str]):
    def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user.get("role") not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker

# ============================================================================
# DATA MODELS
# ============================================================================

# User Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: Literal["admin", "branch_manager", "waiter", "kitchen_staff", "delivery_partner", "customer"]
    phone: Optional[str] = None
    branch_id: Optional[str] = None  # Required for branch-specific roles

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    role: str
    phone: Optional[str] = None
    branch_id: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User

# Branch Models
class BranchCreate(BaseModel):
    name: str
    address: str
    phone: str
    email: EmailStr
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_active: bool = True

class Branch(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    address: str
    phone: str
    email: EmailStr
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Menu Models
class MenuCategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    display_order: int = 0

class MenuCategory(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    display_order: int = 0
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MenuItemCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category_id: str
    base_price: float
    image_url: Optional[str] = None
    is_vegetarian: bool = False
    is_available: bool = True
    branch_ids: Optional[List[str]] = None  # If None, available at all branches

class MenuItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    category_id: str
    base_price: float
    image_url: Optional[str] = None
    is_vegetarian: bool = False
    is_available: bool = True
    branch_ids: Optional[List[str]] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Table Models
class TableCreate(BaseModel):
    branch_id: str
    table_number: str
    capacity: int
    location: Optional[str] = None  # e.g., "Window side", "Garden"

class Table(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    branch_id: str
    table_number: str
    capacity: int
    location: Optional[str] = None
    is_occupied: bool = False
    current_order_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Order Models
class OrderItem(BaseModel):
    menu_item_id: str
    menu_item_name: str
    quantity: int
    unit_price: float
    total_price: float

class OrderCreate(BaseModel):
    customer_id: Optional[str] = None  # None for guest orders
    customer_name: str
    customer_phone: str
    customer_email: Optional[EmailStr] = None
    branch_id: str
    order_type: Literal["dine_in", "takeaway", "delivery"]
    items: List[OrderItem]
    delivery_address: Optional[str] = None
    table_id: Optional[str] = None  # For dine-in orders
    special_instructions: Optional[str] = None

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_number: str  # Human-readable order number
    customer_id: Optional[str] = None
    customer_name: str
    customer_phone: str
    customer_email: Optional[EmailStr] = None
    branch_id: str
    order_type: str
    items: List[OrderItem]
    subtotal: float
    tax: float
    total: float
    status: str = "pending"  # pending, confirmed, preparing, ready, out_for_delivery, completed, cancelled
    delivery_address: Optional[str] = None
    table_id: Optional[str] = None
    delivery_partner_id: Optional[str] = None
    special_instructions: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderStatusUpdate(BaseModel):
    status: Literal["pending", "confirmed", "preparing", "ready", "out_for_delivery", "completed", "cancelled"]

# Offer Models
class OfferCreate(BaseModel):
    title: str
    description: str
    discount_type: Literal["percentage", "fixed"]
    discount_value: float
    min_order_value: Optional[float] = None
    valid_from: datetime
    valid_until: datetime
    branch_ids: Optional[List[str]] = None  # If None, valid for all branches

class Offer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    discount_type: str
    discount_value: float
    min_order_value: Optional[float] = None
    valid_from: datetime
    valid_until: datetime
    branch_ids: Optional[List[str]] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ============================================================================
# AUTHENTICATION ROUTES
# ============================================================================

@api_router.post("/auth/register", response_model=AuthResponse)
async def register(user_data: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Validate branch_id for branch-specific roles
    if user_data.role in ["branch_manager", "waiter", "kitchen_staff", "delivery_partner"]:
        if not user_data.branch_id:
            raise HTTPException(status_code=400, detail="branch_id is required for this role")
        branch = await db.branches.find_one({"id": user_data.branch_id}, {"_id": 0})
        if not branch:
            raise HTTPException(status_code=400, detail="Invalid branch_id")
    
    # Create user
    hashed_password = hash_password(user_data.password)
    user_dict = user_data.model_dump(exclude={"password"})
    user = User(**user_dict)
    
    doc = user.model_dump()
    doc["hashed_password"] = hashed_password
    doc["created_at"] = doc["created_at"].isoformat()
    
    await db.users.insert_one(doc)
    
    # Create access token
    access_token = create_access_token(data={"sub": user.id, "role": user.role})
    
    return AuthResponse(access_token=access_token, user=user)

@api_router.post("/auth/login", response_model=AuthResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account is deactivated")
    
    # Convert datetime string back to datetime object
    if isinstance(user['created_at'], str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    
    user_obj = User(**{k: v for k, v in user.items() if k != "hashed_password"})
    access_token = create_access_token(data={"sub": user_obj.id, "role": user_obj.role})
    
    return AuthResponse(access_token=access_token, user=user_obj)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: dict = Depends(get_current_user)):
    if isinstance(current_user['created_at'], str):
        current_user['created_at'] = datetime.fromisoformat(current_user['created_at'])
    return User(**{k: v for k, v in current_user.items() if k != "hashed_password"})

# ============================================================================
# BRANCH ROUTES
# ============================================================================

@api_router.post("/branches", response_model=Branch)
async def create_branch(branch_data: BranchCreate, current_user: dict = Depends(require_role(["admin"]))):
    branch = Branch(**branch_data.model_dump())
    doc = branch.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.branches.insert_one(doc)
    return branch

@api_router.get("/branches", response_model=List[Branch])
async def get_branches(is_active: Optional[bool] = None):
    query = {}
    if is_active is not None:
        query["is_active"] = is_active
    
    branches = await db.branches.find(query, {"_id": 0}).to_list(1000)
    for branch in branches:
        if isinstance(branch['created_at'], str):
            branch['created_at'] = datetime.fromisoformat(branch['created_at'])
    return branches

@api_router.get("/branches/{branch_id}", response_model=Branch)
async def get_branch(branch_id: str):
    branch = await db.branches.find_one({"id": branch_id}, {"_id": 0})
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")
    if isinstance(branch['created_at'], str):
        branch['created_at'] = datetime.fromisoformat(branch['created_at'])
    return branch

@api_router.put("/branches/{branch_id}", response_model=Branch)
async def update_branch(branch_id: str, branch_data: BranchCreate, current_user: dict = Depends(require_role(["admin"]))):
    existing_branch = await db.branches.find_one({"id": branch_id}, {"_id": 0})
    if not existing_branch:
        raise HTTPException(status_code=404, detail="Branch not found")
    
    update_data = branch_data.model_dump()
    await db.branches.update_one({"id": branch_id}, {"$set": update_data})
    
    updated_branch = await db.branches.find_one({"id": branch_id}, {"_id": 0})
    if isinstance(updated_branch['created_at'], str):
        updated_branch['created_at'] = datetime.fromisoformat(updated_branch['created_at'])
    return updated_branch

# ============================================================================
# MENU CATEGORY ROUTES
# ============================================================================

@api_router.post("/menu/categories", response_model=MenuCategory)
async def create_category(category_data: MenuCategoryCreate, current_user: dict = Depends(require_role(["admin"]))):
    category = MenuCategory(**category_data.model_dump())
    doc = category.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.menu_categories.insert_one(doc)
    return category

@api_router.get("/menu/categories", response_model=List[MenuCategory])
async def get_categories():
    categories = await db.menu_categories.find({"is_active": True}, {"_id": 0}).sort("display_order", 1).to_list(1000)
    for category in categories:
        if isinstance(category['created_at'], str):
            category['created_at'] = datetime.fromisoformat(category['created_at'])
    return categories

# ============================================================================
# MENU ITEM ROUTES
# ============================================================================

@api_router.post("/menu/items", response_model=MenuItem)
async def create_menu_item(item_data: MenuItemCreate, current_user: dict = Depends(require_role(["admin"]))):
    # Validate category exists
    category = await db.menu_categories.find_one({"id": item_data.category_id}, {"_id": 0})
    if not category:
        raise HTTPException(status_code=400, detail="Invalid category_id")
    
    item = MenuItem(**item_data.model_dump())
    doc = item.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.menu_items.insert_one(doc)
    return item

@api_router.get("/menu/items", response_model=List[MenuItem])
async def get_menu_items(category_id: Optional[str] = None, branch_id: Optional[str] = None):
    query = {"is_available": True}
    if category_id:
        query["category_id"] = category_id
    
    items = await db.menu_items.find(query, {"_id": 0}).to_list(1000)
    
    # Filter by branch if specified
    if branch_id:
        filtered_items = []
        for item in items:
            # If branch_ids is None, item is available at all branches
            if item.get("branch_ids") is None or branch_id in item.get("branch_ids", []):
                filtered_items.append(item)
        items = filtered_items
    
    for item in items:
        if isinstance(item['created_at'], str):
            item['created_at'] = datetime.fromisoformat(item['created_at'])
    return items

@api_router.put("/menu/items/{item_id}", response_model=MenuItem)
async def update_menu_item(item_id: str, item_data: MenuItemCreate, current_user: dict = Depends(require_role(["admin"]))):
    existing_item = await db.menu_items.find_one({"id": item_id}, {"_id": 0})
    if not existing_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    update_data = item_data.model_dump()
    await db.menu_items.update_one({"id": item_id}, {"$set": update_data})
    
    updated_item = await db.menu_items.find_one({"id": item_id}, {"_id": 0})
    if isinstance(updated_item['created_at'], str):
        updated_item['created_at'] = datetime.fromisoformat(updated_item['created_at'])
    return updated_item

# ============================================================================
# TABLE ROUTES
# ============================================================================

@api_router.post("/tables", response_model=Table)
async def create_table(table_data: TableCreate, current_user: dict = Depends(require_role(["admin", "branch_manager"]))):
    # Validate branch exists
    branch = await db.branches.find_one({"id": table_data.branch_id}, {"_id": 0})
    if not branch:
        raise HTTPException(status_code=400, detail="Invalid branch_id")
    
    table = Table(**table_data.model_dump())
    doc = table.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.tables.insert_one(doc)
    return table

@api_router.get("/tables", response_model=List[Table])
async def get_tables(branch_id: Optional[str] = None):
    query = {}
    if branch_id:
        query["branch_id"] = branch_id
    
    tables = await db.tables.find(query, {"_id": 0}).to_list(1000)
    for table in tables:
        if isinstance(table['created_at'], str):
            table['created_at'] = datetime.fromisoformat(table['created_at'])
    return tables

@api_router.put("/tables/{table_id}/status")
async def update_table_status(table_id: str, is_occupied: bool, order_id: Optional[str] = None):
    update_data = {"is_occupied": is_occupied}
    if order_id:
        update_data["current_order_id"] = order_id
    elif not is_occupied:
        update_data["current_order_id"] = None
    
    result = await db.tables.update_one({"id": table_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Table not found")
    return {"message": "Table status updated"}

# ============================================================================
# ORDER ROUTES
# ============================================================================

@api_router.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate):
    # Validate branch exists
    branch = await db.branches.find_one({"id": order_data.branch_id}, {"_id": 0})
    if not branch:
        raise HTTPException(status_code=400, detail="Invalid branch_id")
    
    # Calculate totals
    subtotal = sum(item.total_price for item in order_data.items)
    gst = subtotal * 0.05  # 5% GST (India)
    total = subtotal + gst
    
    # Generate order number
    order_count = await db.orders.count_documents({}) + 1
    order_number = f"ALT{order_count:06d}"
    
    order_dict = order_data.model_dump()
    order_dict.update({
        "order_number": order_number,
        "subtotal": subtotal,
        "tax": tax,
        "total": total,
        "status": "pending"
    })
    
    order = Order(**order_dict)
    doc = order.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["updated_at"] = doc["updated_at"].isoformat()
    
    await db.orders.insert_one(doc)
    
    # Update table status if dine-in
    if order_data.order_type == "dine_in" and order_data.table_id:
        await db.tables.update_one(
            {"id": order_data.table_id},
            {"$set": {"is_occupied": True, "current_order_id": order.id}}
        )
    
    return order

@api_router.get("/orders", response_model=List[Order])
async def get_orders(
    branch_id: Optional[str] = None,
    status: Optional[str] = None,
    order_type: Optional[str] = None,
    customer_id: Optional[str] = None
):
    query = {}
    if branch_id:
        query["branch_id"] = branch_id
    if status:
        query["status"] = status
    if order_type:
        query["order_type"] = order_type
    if customer_id:
        query["customer_id"] = customer_id
    
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for order in orders:
        if isinstance(order['created_at'], str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
        if isinstance(order['updated_at'], str):
            order['updated_at'] = datetime.fromisoformat(order['updated_at'])
    return orders

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if isinstance(order['created_at'], str):
        order['created_at'] = datetime.fromisoformat(order['created_at'])
    if isinstance(order['updated_at'], str):
        order['updated_at'] = datetime.fromisoformat(order['updated_at'])
    return order

@api_router.put("/orders/{order_id}/status", response_model=Order)
async def update_order_status(order_id: str, status_update: OrderStatusUpdate):
    existing_order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not existing_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    update_data = {
        "status": status_update.status,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.orders.update_one({"id": order_id}, {"$set": update_data})
    
    # If order is completed and was dine-in, free up the table
    if status_update.status == "completed" and existing_order.get("table_id"):
        await db.tables.update_one(
            {"id": existing_order["table_id"]},
            {"$set": {"is_occupied": False, "current_order_id": None}}
        )
    
    updated_order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if isinstance(updated_order['created_at'], str):
        updated_order['created_at'] = datetime.fromisoformat(updated_order['created_at'])
    if isinstance(updated_order['updated_at'], str):
        updated_order['updated_at'] = datetime.fromisoformat(updated_order['updated_at'])
    return updated_order

# ============================================================================
# OFFER ROUTES
# ============================================================================

@api_router.post("/offers", response_model=Offer)
async def create_offer(offer_data: OfferCreate, current_user: dict = Depends(require_role(["admin"]))):
    offer = Offer(**offer_data.model_dump())
    doc = offer.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["valid_from"] = doc["valid_from"].isoformat()
    doc["valid_until"] = doc["valid_until"].isoformat()
    await db.offers.insert_one(doc)
    return offer

@api_router.get("/offers", response_model=List[Offer])
async def get_offers(branch_id: Optional[str] = None):
    now = datetime.now(timezone.utc)
    query = {
        "is_active": True,
        "valid_from": {"$lte": now.isoformat()},
        "valid_until": {"$gte": now.isoformat()}
    }
    
    offers = await db.offers.find(query, {"_id": 0}).to_list(1000)
    
    # Filter by branch if specified
    if branch_id:
        filtered_offers = []
        for offer in offers:
            if offer.get("branch_ids") is None or branch_id in offer.get("branch_ids", []):
                filtered_offers.append(offer)
        offers = filtered_offers
    
    for offer in offers:
        if isinstance(offer['created_at'], str):
            offer['created_at'] = datetime.fromisoformat(offer['created_at'])
        if isinstance(offer['valid_from'], str):
            offer['valid_from'] = datetime.fromisoformat(offer['valid_from'])
        if isinstance(offer['valid_until'], str):
            offer['valid_until'] = datetime.fromisoformat(offer['valid_until'])
    return offers

# ============================================================================
# REPORTS & ANALYTICS ROUTES
# ============================================================================

@api_router.get("/reports/sales")
async def get_sales_report(
    branch_id: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: dict = Depends(require_role(["admin", "branch_manager"]))
):
    query = {"status": {"$in": ["completed"]}}
    
    if branch_id:
        query["branch_id"] = branch_id
    
    if start_date:
        query["created_at"] = {"$gte": start_date}
    if end_date:
        query.setdefault("created_at", {})["$lte"] = end_date
    
    orders = await db.orders.find(query, {"_id": 0}).to_list(10000)
    
    total_revenue = sum(order.get("total", 0) for order in orders)
    total_orders = len(orders)
    avg_order_value = total_revenue / total_orders if total_orders > 0 else 0
    
    # Order type breakdown
    order_type_counts = {}
    for order in orders:
        order_type = order.get("order_type", "unknown")
        order_type_counts[order_type] = order_type_counts.get(order_type, 0) + 1
    
    return {
        "total_revenue": round(total_revenue, 2),
        "total_orders": total_orders,
        "average_order_value": round(avg_order_value, 2),
        "order_type_breakdown": order_type_counts,
        "period": {
            "start_date": start_date,
            "end_date": end_date
        }
    }

@api_router.get("/reports/branch-performance")
async def get_branch_performance(current_user: dict = Depends(require_role(["admin"]))):
    branches = await db.branches.find({"is_active": True}, {"_id": 0}).to_list(1000)
    
    performance_data = []
    for branch in branches:
        orders = await db.orders.find(
            {"branch_id": branch["id"], "status": "completed"},
            {"_id": 0}
        ).to_list(10000)
        
        total_revenue = sum(order.get("total", 0) for order in orders)
        total_orders = len(orders)
        
        performance_data.append({
            "branch_id": branch["id"],
            "branch_name": branch["name"],
            "total_revenue": round(total_revenue, 2),
            "total_orders": total_orders,
            "avg_order_value": round(total_revenue / total_orders, 2) if total_orders > 0 else 0
        })
    
    return performance_data

# ============================================================================
# DASHBOARD STATS
# ============================================================================

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(
    branch_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if branch_id:
        query["branch_id"] = branch_id
    
    # Total orders by status
    all_orders = await db.orders.find(query, {"_id": 0}).to_list(10000)
    
    status_counts = {}
    for order in all_orders:
        status = order.get("status", "unknown")
        status_counts[status] = status_counts.get(status, 0) + 1
    
    # Today's revenue
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_query = {**query, "created_at": {"$gte": today_start.isoformat()}, "status": "completed"}
    today_orders = await db.orders.find(today_query, {"_id": 0}).to_list(10000)
    today_revenue = sum(order.get("total", 0) for order in today_orders)
    
    return {
        "total_orders": len(all_orders),
        "orders_by_status": status_counts,
        "today_revenue": round(today_revenue, 2),
        "today_orders": len(today_orders)
    }

# ============================================================================
# USER MANAGEMENT ROUTES
# ============================================================================

@api_router.get("/users", response_model=List[User])
async def get_all_users(current_user: dict = Depends(require_role(["admin"]))):
    """Get all users - Admin only"""
    users = await db.users.find({}, {"_id": 0, "hashed_password": 0}).to_list(1000)
    
    for user_doc in users:
        if isinstance(user_doc.get('created_at'), str):
            user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return users

# ============================================================================
# ROOT ROUTE
# ============================================================================

@api_router.get("/")
async def root():
    return {
        "message": "Al Taj Restaurant Multi-Branch System API",
        "version": "1.0.0",
        "status": "operational"
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
