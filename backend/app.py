from flask import Flask, jsonify, request
from flask_cors import CORS
from routes import api_bp
import os

app = Flask(__name__)
# Enable CORS for frontend running on Vite (usually port 5173)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Default configuration (can be moved to .env later)
app.config['SECRET_KEY'] = 'hackathon_super_secret_key'

# Register API routes
app.register_blueprint(api_bp, url_prefix='/api')

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'message': 'Campus Intelligence API is running'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
