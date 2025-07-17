# ==============================================================================
# IMPORTS & INITIALIZATION
# ==============================================================================
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, JWTManager, decode_token
from flask_cors import CORS
from flask_socketio import SocketIO, emit, disconnect

# Load environment variables from .env file
load_dotenv()

# Initialize Flask App
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")

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
chat_participants = db.Table('chat_participants',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('chat_id', db.Integer, db.ForeignKey('chats.id'), primary_key=True)
)

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
        if len(password) < 6: raise ValueError("Password must be at least 6 characters long.")
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

class ChatModel(db.Model):
    __tablename__ = 'chats'
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    messages = db.relationship('MessageModel', backref='chat', lazy=True, cascade="all, delete-orphan")
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    participants = db.relationship('UserModel', secondary=chat_participants, lazy='subquery', backref=db.backref('chats', lazy=True))

class MessageModel(db.Model):
    __tablename__ = 'messages'
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    chat_id = db.Column(db.Integer, db.ForeignKey('chats.id'), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    sender = db.relationship('UserModel', backref='messages')

# ==============================================================================
# API HELPER FUNCTIONS & GLOBAL VARS
# ==============================================================================
user_sids = {} # In-memory mapping of user_id to session_id

def serialize_product(p, is_detailed=False):
    data = { "id": p.id, "name": p.name, "price": p.price, "photos": p.photos, "category": p.category, "condition": p.condition, "status": p.status, "address": p.address, "created_at": p.created_at.isoformat(), "seller": { "id": p.seller.id, "username": p.seller.username } }
    if is_detailed:
        data['seller']['phone'] = p.seller.phone
        data['seller']['address'] = p.seller.address
        data['seller']['member_since'] = p.seller.created_at.isoformat()
    return data

# ==============================================================================
# AUTHENTICATION API ENDPOINTS (No changes here)
# ==============================================================================
@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data=request.get_json(); required_fields=['fullName','username','phone','email','password','address']
    if not data or not all(k in data for k in required_fields): return jsonify({"msg":"Missing required fields"}),400
    if UserModel.query.filter((UserModel.username==data['username'])|(UserModel.email==data['email'])|(UserModel.phone==data['phone'])).first(): return jsonify({"msg":"Conflict: Username, email, or phone already exists"}),409
    try:
        new_user=UserModel(username=data['username'],fullName=data['fullName'],phone=data['phone'],email=data['email'],address=data['address'])
        new_user.set_password(data['password'])
    except ValueError as e: return jsonify({"msg":str(e)}),400
    db.session.add(new_user); db.session.commit()
    access_token=create_access_token(identity=new_user.id)
    return jsonify(access_token=access_token),201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data=request.get_json()
    if not data or not all(k in data for k in ['phone','password']): return jsonify({"msg":"Missing phone or password"}),400
    user=UserModel.query.filter_by(phone=data['phone']).first()
    if user and user.check_password(data['password']):
        access_token=create_access_token(identity=user.id)
        return jsonify(access_token=access_token),200
    return jsonify({"msg":"Invalid phone number or password"}),401

# ==============================================================================
# PRODUCT API ENDPOINTS (No changes here)
# ==============================================================================
@app.route('/api/products', methods=['POST'])
@jwt_required()
def create_product():
    current_user_id=get_jwt_identity(); data=request.get_json()
    required_fields=['name','photos','category','condition','price','address']
    if not data or not all(k in data for k in required_fields): return jsonify({"msg":"Missing required product fields"}),400
    if not isinstance(data['photos'], list) or not data['photos']: return jsonify({"msg":"Photos must be a non-empty list of URLs"}),400
    try:
        price=float(data['price'])
        if price <= 0: raise ValueError()
    except(ValueError,TypeError): return jsonify({"msg":"Invalid price format"}),400
    new_product=ProductModel(seller_id=current_user_id,name=data['name'],photos=data['photos'],category=data['category'],condition=data['condition'],price=price,address=data['address'])
    db.session.add(new_product); db.session.commit()
    return jsonify(serialize_product(new_product, is_detailed=True)),201

@app.route('/api/products', methods=['GET'])
def get_products():
    products=ProductModel.query.filter_by(status='Available').order_by(ProductModel.created_at.desc()).all()
    return jsonify([serialize_product(p) for p in products]),200

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product_detail(product_id):
    product=ProductModel.query.get_or_404(product_id)
    return jsonify(serialize_product(product, is_detailed=True)),200

# ==============================================================================
# SOCKETIO HANDLERS
# ==============================================================================
@socketio.on('connect')
def handle_connect():
    token = request.args.get('token')
    if not token:
        disconnect()
        return
    try:
        # Manually decode token to get user identity without requiring @jwt_required
        decoded_token = decode_token(token)
        user_id = decoded_token['sub']
        user_sids[user_id] = request.sid
        print(f"Client connected: user_id {user_id} with sid {request.sid}")
    except Exception as e:
        print(f"Authentication failed: {e}")
        disconnect()

@socketio.on('disconnect')
def handle_disconnect():
    # Find which user this sid belonged to and remove them
    disconnected_user_id = None
    for user_id, sid in user_sids.items():
        if sid == request.sid:
            disconnected_user_id = user_id
            break
    if disconnected_user_id:
        del user_sids[disconnected_user_id]
        print(f"Client disconnected: user_id {disconnected_user_id} with sid {request.sid}")

@socketio.on('client:request_purchase')
def handle_purchase_request(data):
    # This handler requires the user to be connected (and thus authenticated)
    requesting_user_id = None
    for user_id, sid in user_sids.items():
        if sid == request.sid:
            requesting_user_id = user_id
            break
    
    if not requesting_user_id:
        emit('server:error', {'msg': 'Authentication error.'})
        return

    product_id = data.get('productId')
    product = ProductModel.query.get(product_id)

    if not product:
        emit('server:error', {'msg': 'Product not found.'})
        return
    if product.status != 'Available':
        emit('server:error', {'msg': 'Product is not available for purchase.'})
        return
    if product.seller_id == requesting_user_id:
        emit('server:error', {'msg': 'You cannot purchase your own item.'})
        return

    # All checks passed, update product status
    product.status = 'Pending'
    db.session.commit()

    # Notify the seller
    seller_sid = user_sids.get(product.seller_id)
    if seller_sid:
        requesting_user = UserModel.query.get(requesting_user_id)
        emit('server:new_request', {
            'productName': product.name,
            'productId': product.id,
            'buyerUsername': requesting_user.username,
            'buyerId': requesting_user.id
        }, room=seller_sid)
    
    # Notify the buyer that the request was sent
    emit('server:request_sent', {'msg': f"Your request for '{product.name}' has been sent."})


# ==============================================================================
# APPLICATION RUNNER
# ==============================================================================
if __name__ == '__main__':
    import eventlet
    eventlet.monkey_patch()

    with app.app_context():
        db.create_all()

    socketio.run(app, host='0.0.0.0', port=int(os.environ.get("PORT", 5000)))
