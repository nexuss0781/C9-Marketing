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
from flask_socketio import SocketIO, emit, disconnect, join_room, leave_room

load_dotenv()
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")

# ==============================================================================
# CONFIGURATION
# ==============================================================================
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
if not app.config['SQLALCHEMY_DATABASE_URI']: raise ValueError("No DATABASE_URL set")
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')
if not app.config['JWT_SECRET_KEY']: raise ValueError("No JWT_SECRET_KEY set")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=1)

# ==============================================================================
# EXTENSIONS
# ==============================================================================
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# ==============================================================================
# DATABASE MODELS
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
    # NEW FIELDS FOR PHASE 3
    bio = db.Column(db.Text, nullable=True)
    profilePhotoUrl = db.Column(db.String(255), nullable=True, default='https://via.placeholder.com/150')
    socialMedia = db.Column(db.JSON, nullable=True) # e.g., {"telegram": "user", "twitter": "user"}

    products = db.relationship('ProductModel', backref='seller', lazy=True, cascade="all, delete-orphan")
    notifications = db.relationship('NotificationModel', backref='recipient', lazy=True, cascade="all, delete-orphan")
    
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
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    seller_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

class ChatModel(db.Model):
    __tablename__ = 'chats'
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    messages = db.relationship('MessageModel', backref='chat', lazy=True, cascade="all, delete-orphan")
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    product = db.relationship('ProductModel', backref='chat_link', uselist=False)
    participants = db.relationship('UserModel', secondary=chat_participants, lazy='subquery', backref=db.backref('chats', lazy=True))

class MessageModel(db.Model):
    __tablename__ = 'messages'
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    chat_id = db.Column(db.Integer, db.ForeignKey('chats.id'), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    sender = db.relationship('UserModel', backref='messages')

# NEW MODEL FOR PHASE 3
class NotificationModel(db.Model):
    __tablename__ = 'notifications'
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(255), nullable=False)
    is_read = db.Column(db.Boolean, default=False, nullable=False)
    link_url = db.Column(db.String(255), nullable=True) # e.g., /chat/123
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    recipient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

# ==============================================================================
# API HELPERS & GLOBAL VARS
# ==============================================================================
user_sids = {}

def serialize_product(p, is_detailed=False):
    #... (no changes)
    data = { "id": p.id, "name": p.name, "price": p.price, "photos": p.photos, "category": p.category, "condition": p.condition, "status": p.status, "address": p.address, "created_at": p.created_at.isoformat(), "seller": { "id": p.seller.id, "username": p.seller.username } }
    if is_detailed:
        data['seller']['phone'] = p.seller.phone; data['seller']['address'] = p.seller.address; data['seller']['member_since'] = p.seller.created_at.isoformat()
    return data

# NEW HELPER FOR PHASE 3
def create_notification(user_id, content, link_url):
    """Creates and saves a notification for a user."""
    notification = NotificationModel(recipient_id=user_id, content=content, link_url=link_url)
    db.session.add(notification)
    db.session.commit()

# ==============================================================================
# API ENDPOINTS
# ==============================================================================
# --- Auth endpoints (no changes)
@app.route('/api/auth/signup', methods=['POST'])
def signup(): #... (no changes)
    data=request.get_json(); required_fields=['fullName','username','phone','email','password','address'];
    if not data or not all(k in data for k in required_fields): return jsonify({"msg":"Missing required fields"}),400
    if UserModel.query.filter((UserModel.username==data['username'])|(UserModel.email==data['email'])|(UserModel.phone==data['phone'])).first(): return jsonify({"msg":"Conflict: Username, email, or phone already exists"}),409
    try: new_user=UserModel(username=data['username'],fullName=data['fullName'],phone=data['phone'],email=data['email'],address=data['address']); new_user.set_password(data['password'])
    except ValueError as e: return jsonify({"msg":str(e)}),400
    db.session.add(new_user); db.session.commit(); access_token=create_access_token(identity=new_user.id); return jsonify(access_token=access_token),201
@app.route('/api/auth/login', methods=['POST'])
def login(): #... (no changes)
    data=request.get_json();
    if not data or not all(k in data for k in ['phone','password']): return jsonify({"msg":"Missing phone or password"}),400
    user=UserModel.query.filter_by(phone=data['phone']).first();
    if user and user.check_password(data['password']): access_token=create_access_token(identity=user.id); return jsonify(access_token=access_token),200
    return jsonify({"msg":"Invalid phone number or password"}),401

# --- Product endpoints (UPDATED and NEW)
@app.route('/api/products', methods=['POST']) #... (no changes)
@jwt_required()
def create_product():
    current_user_id=get_jwt_identity(); data=request.get_json(); required_fields=['name','photos','category','condition','price','address'];
    if not data or not all(k in data for k in required_fields): return jsonify({"msg":"Missing required product fields"}),400
    if not isinstance(data['photos'], list) or not data['photos']: return jsonify({"msg":"Photos must be a non-empty list of URLs"}),400
    try: price=float(data['price']);
    except(ValueError,TypeError): return jsonify({"msg":"Invalid price format"}),400
    new_product=ProductModel(seller_id=current_user_id,name=data['name'],photos=data['photos'],category=data['category'],condition=data['condition'],price=price,address=data['address']);
    db.session.add(new_product); db.session.commit(); return jsonify(serialize_product(new_product, is_detailed=True)),201

@app.route('/api/products', methods=['GET'])
def get_products():
    # UPDATED for sorting
    sort_by = request.args.get('sortBy', 'date') # Default sort by date
    order = request.args.get('order', 'desc') # Default descending

    query = ProductModel.query.filter_by(status='Available')

    if sort_by == 'price':
        sort_column = ProductModel.price
    else: # Default to date
        sort_column = ProductModel.created_at

    if order == 'asc':
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())
        
    products = query.all()
    return jsonify([serialize_product(p) for p in products]), 200

@app.route('/api/products/<int:product_id>', methods=['GET']) #... (no changes)
def get_product_detail(product_id): product=ProductModel.query.get_or_404(product_id); return jsonify(serialize_product(product, is_detailed=True)),200

# NEW ENDPOINT for marking as sold
@app.route('/api/products/<int:product_id>/sold', methods=['PUT'])
@jwt_required()
def mark_as_sold(product_id):
    current_user_id = get_jwt_identity()
    product = ProductModel.query.get_or_404(product_id)

    if product.seller_id != current_user_id:
        return jsonify({"msg": "Unauthorized action"}), 403
    
    product.status = 'Sold'
    db.session.commit()

    # Find the other participant in the chat to notify them
    chat = ChatModel.query.filter_by(product_id=product.id).first()
    if chat:
        for participant in chat.participants:
            if participant.id != current_user_id:
                create_notification(
                    user_id=participant.id, 
                    content=f"The item '{product.name}' has been marked as sold.",
                    link_url=f"/product/{product.id}"
                )

    return jsonify({"msg": "Product marked as sold"}), 200


# --- Chat/Profile/Notification endpoints (to be built)

# ==============================================================================
# SOCKETIO HANDLERS
# ==============================================================================
def get_user_id_from_sid(sid): #... (no changes)
    for user_id, user_sid in user_sids.items():
        if user_sid == sid: return user_id
    return None

@socketio.on('connect') #... (no changes)
def handle_connect():
    token = request.args.get('token');
    if not token: disconnect()
    try: user_id = decode_token(token)['sub']; user_sids[user_id] = request.sid; print(f"Client connected: user_id {user_id} with sid {request.sid}")
    except Exception: disconnect()

@socketio.on('disconnect') #... (no changes)
def handle_disconnect():
    user_id = get_user_id_from_sid(request.sid);
    if user_id: del user_sids[user_id]; print(f"Client disconnected: user_id {user_id} with sid {request.sid}")

@socketio.on('client:request_purchase') #... (no changes)
def handle_purchase_request(data):
    requesting_user_id = get_user_id_from_sid(request.sid);
    if not requesting_user_id: return emit('server:error', {'msg': 'Authentication error.'})
    product = ProductModel.query.get(data.get('productId'));
    if not product or product.status != 'Available' or product.seller_id == requesting_user_id: return emit('server:error', {'msg': 'Product not available or invalid request.'})
    product.status = 'Pending'; db.session.commit(); seller_sid = user_sids.get(product.seller_id);
    if seller_sid:
        requesting_user = UserModel.query.get(requesting_user_id);
        emit('server:new_request', {'productName': product.name, 'productId': product.id, 'buyerUsername': requesting_user.username, 'buyerId': requesting_user.id}, room=seller_sid)
    emit('server:request_sent', {'msg': f"Request for '{product.name}' sent."})

@socketio.on('client:accept_request') # UPDATED to add notification
def handle_accept_request(data):
    seller_id = get_user_id_from_sid(request.sid); buyer_id = data.get('buyerId'); product_id = data.get('productId');
    product = ProductModel.query.get(product_id);
    if not product or product.seller_id != seller_id: return emit('server:error', {'msg': 'Invalid request acceptance.'})
    seller = UserModel.query.get(seller_id); buyer = UserModel.query.get(buyer_id);
    new_chat = ChatModel(product_id=product_id, participants=[seller, buyer]); db.session.add(new_chat); db.session.commit();
    chat_room_name = f'chat_{new_chat.id}'; buyer_sid = user_sids.get(buyer_id);
    if buyer_sid: join_room(chat_room_name, sid=buyer_sid)
    join_room(chat_room_name, sid=request.sid)
    
    # Notify buyer that the chat has started
    create_notification(
        user_id=buyer_id, 
        content=f"{seller.username} accepted your request for '{product.name}'. You can now chat.",
        link_url=f"/chat/{new_chat.id}"
    )
    emit('server:chat_started', {'chatId': new_chat.id}, room=chat_room_name)

@socketio.on('client:send_message') # UPDATED to add notification
def handle_send_message(data):
    sender_id = get_user_id_from_sid(request.sid); chat_id = data.get('chatId'); content = data.get('content');
    if not sender_id or not chat_id or not content: return
    chat = ChatModel.query.get(chat_id);
    if sender_id not in [p.id for p in chat.participants]: return
    new_message = MessageModel(chat_id=chat_id, sender_id=sender_id, content=content); db.session.add(new_message); db.session.commit();
    message_data = { "id": new_message.id, "content": new_message.content, "timestamp": new_message.timestamp.isoformat(), "sender_id": new_message.sender_id, "sender_username": new_message.sender.username }
    
    # Notify the OTHER participant
    for participant in chat.participants:
        if participant.id != sender_id:
            create_notification(
                user_id=participant.id,
                content=f"You have a new message from {new_message.sender.username} regarding '{chat.product.name}'.",
                link_url=f"/chat/{chat.id}"
            )
            
    emit('server:new_message', message_data, room=f'chat_{chat_id}')


# ==============================================================================
# APPLICATION RUNNER
# ==============================================================================
if __name__ == '__main__':
    import eventlet
    eventlet.monkey_patch()
    with app.app_context():
        db.create_all()
    socketio.run(app, host='0.0.0.0', port=int(os.environ.get("PORT", 5000)))
