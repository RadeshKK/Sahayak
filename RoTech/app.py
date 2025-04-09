from flask import Flask, render_template, request, jsonify, session
from flask_socketio import SocketIO, emit
from datetime import datetime
import json
import logging
from functools import wraps
import uuid
from flask_cors import CORS

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'  # Change this in production
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False  # Set to True in production with HTTPS

# Enable CORS for all routes
CORS(app, resources={r"/*": {"origins": "*"}})

socketio = SocketIO(app, 
                   cors_allowed_origins="*",
                   async_mode='threading',
                   manage_session=True)

# Store messages and events in memory (in production, use a database)
messages = []
active_users = {}  # Store active users by session ID
events = []

def handle_errors(f):
    @wraps(f)
    def wrapped(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            logger.error(f"Error in {f.__name__}: {str(e)}")
            emit('error', {'message': 'An error occurred'})
    return wrapped

def broadcast_user_count():
    """Broadcast the current user count to all connected clients"""
    count = len(active_users)
    logger.info(f"Broadcasting user count: {count}")
    emit('user_count', {'count': count}, broadcast=True)

@app.route('/')
def index():
    # Generate a session ID if not exists
    if 'session_id' not in session:
        session['session_id'] = str(uuid.uuid4())
    return render_template('index.html')

@socketio.on('connect')
@handle_errors
def handle_connect():
    # Get session ID from the client
    session_id = request.args.get('session_id')
    if not session_id:
        session_id = str(uuid.uuid4())
    
    # Generate a unique user ID if not provided
    user_id = request.args.get('user_id')
    if not user_id:
        user_id = str(uuid.uuid4())
    
    # Store user info with session ID
    active_users[session_id] = {
        'id': user_id,
        'session_id': session_id,
        'name': f"User-{user_id[:8]}",  # Generate a readable name
        'connected_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'ip': request.remote_addr,
        'socket_id': request.sid
    }
    
    logger.info(f"User connected: {active_users[session_id]['name']} (ID: {user_id}, Session: {session_id}, IP: {request.remote_addr})")
    logger.info(f"Total users online: {len(active_users)}")
    
    # Send initial user count to the connecting client
    emit('user_count', {'count': len(active_users)})
    
    # Broadcast updated user count and user connected event to all clients
    broadcast_user_count()
    emit('user_connected', {'user': active_users[session_id]}, broadcast=True)

@socketio.on('disconnect')
@handle_errors
def handle_disconnect():
    # Find the user by socket ID
    for session_id, user_info in list(active_users.items()):
        if user_info['socket_id'] == request.sid:
            del active_users[session_id]
            logger.info(f"User disconnected: {user_info['name']} (Session: {session_id}, IP: {user_info['ip']})")
            logger.info(f"Total users online: {len(active_users)}")
            
            # Broadcast updated user count and user disconnected event
            broadcast_user_count()
            emit('user_disconnected', {'user': user_info}, broadcast=True)
            break

@socketio.on('send_message')
@handle_errors
def handle_message(data):
    if not data.get('content'):
        emit('error', {'message': 'Message content is required'})
        return

    # Find the user by socket ID
    user_info = None
    for user in active_users.values():
        if user['socket_id'] == request.sid:
            user_info = user
            break

    if not user_info:
        user_info = {'name': 'Anonymous'}

    message = {
        'sender': user_info['name'],
        'content': data['content'],
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    messages.append(message)
    logger.info(f"New message from {message['sender']}: {message['content']}")
    emit('new_message', message, broadcast=True)

@socketio.on('get_messages')
@handle_errors
def handle_get_messages():
    emit('message_history', messages)

@socketio.on('create_event')
@handle_errors
def handle_create_event(data):
    required_fields = ['title', 'date', 'time', 'location', 'description']
    for field in required_fields:
        if not data.get(field):
            emit('error', {'message': f'{field} is required'})
            return

    # Find the user by socket ID
    user_info = None
    for user in active_users.values():
        if user['socket_id'] == request.sid:
            user_info = user
            break

    if not user_info:
        user_info = {'name': 'Anonymous'}

    event = {
        'id': len(events) + 1,
        'title': data['title'],
        'date': data['date'],
        'time': data['time'],
        'location': data['location'],
        'description': data['description'],
        'created_by': user_info['name'],
        'rsvps': []
    }
    events.append(event)
    logger.info(f"New event created by {user_info['name']}: {event['title']}")
    emit('new_event', event, broadcast=True)

@socketio.on('rsvp_event')
@handle_errors
def handle_rsvp_event(data):
    if not data.get('eventId'):
        emit('error', {'message': 'Event ID is required'})
        return

    # Find the user by socket ID
    user_info = None
    for user in active_users.values():
        if user['socket_id'] == request.sid:
            user_info = user
            break

    if not user_info:
        user_info = {'name': 'Anonymous'}

    event_id = data['eventId']
    
    for event in events:
        if event['id'] == event_id:
            if user_info['name'] in event['rsvps']:
                event['rsvps'].remove(user_info['name'])
                logger.info(f"User {user_info['name']} removed RSVP from event {event_id}")
            else:
                event['rsvps'].append(user_info['name'])
                logger.info(f"User {user_info['name']} RSVP'd to event {event_id}")
            
            emit('event_updated', event, broadcast=True)
            break
    else:
        emit('error', {'message': 'Event not found'})

@socketio.on('get_events')
@handle_errors
def handle_get_events():
    emit('event_history', events)

@socketio.on_error()
def error_handler(e):
    logger.error(f"Socket error: {str(e)}")
    emit('error', {'message': 'An error occurred'})

@socketio.on_error_default
def default_error_handler(e):
    logger.error(f"Default error handler: {str(e)}")
    emit('error', {'message': 'An error occurred'})

if __name__ == '__main__':
    logger.info("Starting server...")
    socketio.run(app, debug=True, host='0.0.0.0', port=5000) 