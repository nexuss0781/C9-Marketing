# ==============================================================================
# IMPORTS & INITIALIZATION
# ==============================================================================
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, JWTManager
from flask_cors import CORS

# Load environment variables from .env file
load_dotenv()

# Initialize Flask App
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}) # Adjust origins for production

# ==============================================================================
# CONFIGURATION
# ==============================================================================
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
if not app.config['SQLALCHEMY_DATABASE_URI']:
    raise ValueError("No DATABASE_URL set for Flask application")

app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')
if not app.config['JWT_SECRET_KEY']:
    raise ValueError("No JWT_SECRET_KEY set for Flask application")

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=1)

# ==============================================================================
# EXTENSIONS
# ==============================================================================
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# ==============================================================================
# DATABASE MODELS (SINGLE SOURCE OF TRUTH)
# ==============================================================================
class UserModel(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    fullName = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    products = db.relationship('ProductModel', backref='seller', lazy=True, cascade="all, delete-orphan")

    def set_password(self, password):
        # Enforce minimum password length
        if len(password) < 6:
            raise ValueError("Password must be at least 6 characters long.")
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

class ProductModel(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    photos = db.Column(db.JSON, nullable=False)
    category = db.Column(db.String(50), nullable=False, index=True)
    condition = db.Column(db.String(10), nullable=False)
    price = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), nullable=False, default='Available', index=True)
    address = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    seller_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

# ==============================================================================
# AUTHENTICATION API ENDPOINTS
# ==============================================================================
@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.get_json()
    required_fields = ['fullName', 'username', 'phone', 'email', 'password', 'address']
    if not data or not all(k in data for k in required_fields):
        return jsonify({"msg": "Missing required fields"}), 400

    # Data validation
    if UserModel.query.filter((UserModel.username == data['username']) | (UserModel.email == data['email']) | (UserModel.phone == data['phone'])).first():
        return jsonify({"msg": "Conflict: Username, email, or phone already exists"}), 409

    try:
        new_user = UserModel(
            username=data['username'],
            fullName=data['fullName'],
            phone=data['phone'],
            email=data['email'],
            address=data['address']
        )
        new_user.set_password(data['password'])
    except ValueError as e:
        return jsonify({"msg": str(e)}), 400

    db.session.add(new_user)
    db.session.commit()
    
    access_token = create_access_token(identity=new_user.id)
    return jsonify(access_token=access_token), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not all(k in data for k in ['phone', 'password']):
        return jsonify({"msg": "Missing phone or password"}), 400
        
    user = UserModel.query.filter_by(phone=data['phone']).first()
    if user and user.check_password(data['password']):
        access_token = create_access_token(identity=user.id)
        return jsonify(access_token=access_token), 200
    
    return jsonify({"msg": "Invalid phone number or password"}), 401

# ==============================================================================
# PRODUCT API ENDPOINTS
# ==============================================================================
def serialize_product(p):
    """Helper function to convert a ProductModel object to a dictionary."""
    return {
        "id": p.id,
        "name": p.name,
        "price": p.price,
        "photos": p.photos,
        "category": p.category,
        "condition": p.condition,
        "address": p.address,
        "created_at": p.created_at.isoformat(),
        "seller": {
            "username": p.seller.username,
            "phone": p.seller.phone
        }
    }

@app.route('/api/products', methods=['POST'])
@jwt_required()
def create_product():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    required_fields = ['name', 'photos', 'category', 'condition', 'price', 'address']
    if not data or not all(k in data for k in required_fields):
        return jsonify({"msg": "Missing required product fields"}), 400
    
    # Data validation
    if not isinstance(data['photos'], list) or not data['photos']:
        return jsonify({"msg": "Photos must be a non-empty list of URLs"}), 400
    try:
        price = float(data['price'])
        if price <= 0:
            raise ValueError()
    except (ValueError, TypeError):
        return jsonify({"msg": "Invalid price format"}), 400

    new_product = ProductModel(
        seller_id=current_user_id,
        name=data['name'],
        photos=data['photos'],
        category=data['category'],
        condition=data['condition'],
        price=price,
        address=data['address']
    )
    db.session.add(new_product)
    db.session.commit()

    return jsonify(serialize_product(new_product)), 201

@app.route('/api/products', methods=['GET'])
def get_products():
    products = ProductModel.query.filter_by(status='Available').order_by(ProductModel.created_at.desc()).all()
    return jsonify([serialize_product(p) for p in products]), 200

# ==============================================================================
# APPLICATION RUNNER
# ==============================================================================
if __name__ == '__main__':
    with app.app_context():
        # This will create tables based on the models if they do not exist.
        db.create_all()
    # Note: Flask-SocketIO is not used in this phase, but the server is run this way for consistency.
    app.run(debug=True)
