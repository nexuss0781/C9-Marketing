# ==============================================================================
# IMPORTS & INITIALIZATION
# ==============================================================================
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    create_access_token, get_jwt_identity,
    jwt_required, JWTManager
)
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ==============================================================================
# CONFIGURATION
# ==============================================================================
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
if not app.config['SQLALCHEMY_DATABASE_URI']:
    raise RuntimeError("DATABASE_URL not set.")

app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')
if not app.config['JWT_SECRET_KEY']:
    raise RuntimeError("JWT_SECRET_KEY not set.")

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=1)

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# ==============================================================================
# MODELS
# ==============================================================================
class UserModel(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    fullName = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    products = db.relationship('ProductModel', backref='seller', lazy=True, cascade="all, delete-orphan")

    def set_password(self, password):
        if len(password) < 6:
            raise ValueError("Password too short.")
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

class ProductModel(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    photos = db.Column(db.JSON, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    condition = db.Column(db.String(10), nullable=False)
    price = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='Available', nullable=False)
    address = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    seller_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

# ==============================================================================
# HELPERS
# ==============================================================================
def serialize_product(p):
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

# ==============================================================================
# AUTH ROUTES
# ==============================================================================
@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.get_json()
    fields = ['fullName', 'username', 'phone', 'email', 'password', 'address']
    if not all(data.get(k) for k in fields):
        return jsonify(msg="Missing fields"), 400

    if UserModel.query.filter(
        (UserModel.username == data['username']) |
        (UserModel.email == data['email']) |
        (UserModel.phone == data['phone'])
    ).first():
        return jsonify(msg="User already exists"), 409

    try:
        user = UserModel(
            username=data['username'],
            fullName=data['fullName'],
            phone=data['phone'],
            email=data['email'],
            address=data['address']
        )
        user.set_password(data['password'])
        db.session.add(user)
        db.session.commit()
    except ValueError as e:
        return jsonify(msg=str(e)), 400

    return jsonify(access_token=create_access_token(identity=user.id)), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    phone = data.get('phone')
    password = data.get('password')

    user = UserModel.query.filter_by(phone=phone).first()
    if not user or not user.check_password(password):
        return jsonify(msg="Invalid credentials"), 401

    return jsonify(access_token=create_access_token(identity=user.id)), 200

# ==============================================================================
# PRODUCT ROUTES
# ==============================================================================
@app.route('/api/products', methods=['POST'])
@jwt_required()
def create_product():
    user_id = get_jwt_identity()
    data = request.get_json()
    fields = ['name', 'photos', 'category', 'condition', 'price', 'address']
    if not all(data.get(k) for k in fields):
        return jsonify(msg="Missing product fields"), 400
    if not isinstance(data['photos'], list):
        return jsonify(msg="Photos must be a list."), 400

    try:
        price = float(data['price'])
        if price <= 0:
            raise ValueError
    except:
        return jsonify(msg="Invalid price"), 400

    product = ProductModel(
        seller_id=user_id,
        name=data['name'],
        photos=data['photos'],
        category=data['category'],
        condition=data['condition'],
        price=price,
        address=data['address']
    )
    db.session.add(product)
    db.session.commit()
    return jsonify(serialize_product(product)), 201

@app.route('/api/products', methods=['GET'])
def get_products():
    products = ProductModel.query.filter_by(status='Available').order_by(ProductModel.created_at.desc()).all()
    return jsonify([serialize_product(p) for p in products]), 200

# ==============================================================================
# ENTRY POINT
# ==============================================================================
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=int(os.environ.get("PORT", 5000)))
