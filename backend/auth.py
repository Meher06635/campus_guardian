import jwt
from datetime import datetime, timedelta
import os
from functools import wraps
from flask import request, jsonify

SECRET_KEY = os.environ.get('SECRET_KEY', 'hackathon_super_secret_key')

def generate_token(user_id, role):
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.utcnow() + timedelta(days=1)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            current_user = {'id': data['user_id'], 'role': data['role']}
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token!'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

def role_required(required_role):
    def decorator(f):
        @wraps(f)
        def decorated_function(current_user, *args, **kwargs):
            if current_user['role'] != required_role:
                return jsonify({'message': 'Permission denied. Requires {} role.'.format(required_role)}), 403
            return f(current_user, *args, **kwargs)
        return decorated_function
    return decorator
