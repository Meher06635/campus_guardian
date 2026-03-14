from flask import Blueprint, request, jsonify
from auth import generate_token, token_required, role_required
from db import get_db_connection
import mysql.connector

api_bp = Blueprint('api', __name__)

# --- Authentication Routes ---

@api_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password') # In a real app, hash this!
    role = data.get('role', 'student')
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'message': 'Database connection failed'}), 500
        
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO users (name, email, password_hash, role) VALUES (%s, %s, %s, %s)",
                       (name, email, password, role))
        conn.commit()
        return jsonify({'message': 'User registered successfully'}), 201
    except mysql.connector.IntegrityError:
        return jsonify({'message': 'Email already exists'}), 400
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@api_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    conn = get_db_connection()
    if not conn:
        # Mock logic if DB isn't running for hackathon setup
        if email == 'admin@test.com' and password == 'admin':
            return jsonify({'token': generate_token(1, 'admin'), 'user': {'name': 'Admin User', 'role': 'admin'}}), 200
        elif email == 'student@test.com' and password == 'student':
             return jsonify({'token': generate_token(2, 'student'), 'user': {'name': 'Student', 'role': 'student'}}), 200
        else:
            return jsonify({'message': 'Database offline. Use mock credentials (student@test.com/student)'}), 500
            
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, name, role, password_hash FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    
    cursor.close()
    conn.close()
    
    if user and user['password_hash'] == password: # In real app, verify hash
        token = generate_token(user['id'], user['role'])
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': user['id'],
                'name': user['name'],
                'role': user['role']
            }
        }), 200
        
    return jsonify({'message': 'Invalid credentials'}), 401


# --- Protected Dashboard Example Routes ---

# --- Student Submission API ---

@api_bp.route('/student/submit', methods=['POST'])
@token_required
@role_required('student')
def submit_student_data(current_user):
    data = request.json
    cgpa = data.get('cgpa')
    attendance = data.get('attendance')
    department = data.get('department')
    semester = data.get('semester')
    counseling_preference = data.get('counselingRequested', False)
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'message': 'Database connection failed'}), 500
    
    cursor = conn.cursor()
    try:
        # Update or Insert Student Profile
        cursor.execute("""
            INSERT INTO student_profiles (user_id, department, semester, cgpa, attendance_percentage, counseling_preference)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE 
                department=%s, semester=%s, cgpa=%s, attendance_percentage=%s, counseling_preference=%s
        """, (current_user['id'], department, semester, cgpa, attendance, 
              'needed' if counseling_preference else 'not_needed',
              department, semester, cgpa, attendance, 
              'needed' if counseling_preference else 'not_needed'))
        
        # Log document metadata (mock file path)
        cursor.execute("INSERT INTO documents (student_id, doc_type, file_path, status) VALUES (%s, %s, %s, %s)",
                       (current_user['id'], 'marks_memo', 'uploads/mock_file.pdf', 'pending'))
        
        conn.commit()
        return jsonify({'message': 'Data submitted successfully to Admin desk'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# --- Admin APIs ---

@api_bp.route('/admin/pending-submissions', methods=['GET'])
@token_required
@role_required('admin')
def get_pending_submissions(current_user):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Joining with users to get names
    cursor.execute("""
        SELECT u.name, p.*, d.status as doc_status
        FROM users u
        JOIN student_profiles p ON u.id = p.user_id
        LEFT JOIN documents d ON u.id = d.student_id
        WHERE d.status = 'pending'
    """)
    submissions = cursor.fetchall()
    
    cursor.close()
    conn.close()
    return jsonify(submissions), 200

@api_bp.route('/admin/approve-student', methods=['POST'])
@token_required
@role_required('admin')
def approve_student(current_user):
    data = request.json
    student_id = data.get('student_id')
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE documents SET status = 'approved' WHERE student_id = %s", (student_id,))
        conn.commit()
        return jsonify({'message': 'Student approved for counseling review'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# --- Counselor & Risk Analyzer APIs ---

@api_bp.route('/counselor/queue', methods=['GET'])
@token_required
@role_required('counselor')
def get_counselor_queue(current_user):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("""
        SELECT u.name, p.*
        FROM users u
        JOIN student_profiles p ON u.id = p.user_id
        JOIN documents d ON u.id = d.student_id
        WHERE d.status = 'approved'
    """)
    queue = cursor.fetchall()
    
    cursor.close()
    conn.close()
    return jsonify(queue), 200

@api_bp.route('/counselor/submit-report', methods=['POST'])
@token_required
@role_required('counselor')
def submit_report(current_user):
    data = request.json
    student_id = data.get('student_id')
    report_text = data.get('suggestions')
    action_type = data.get('action_type')
    
    # Simple Mock AI Risk Analyzer
    risk_score = 0
    risk_report = "AI Analysis: \n"
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM student_profiles WHERE user_id = %s", (student_id,))
        profile = cursor.fetchone()
        
        if profile:
            if profile['attendance_percentage'] < 75: 
                risk_score += 40
                risk_report += "- Low attendance indicates potential dropout risk.\n"
            if profile['cgpa'] < 7.0: 
                risk_score += 30
                risk_report += "- Declining academic performance.\n"
            if profile['counseling_preference'] == 'needed': 
                risk_score += 30
                risk_report += "- Student explicitly requested help (High priority).\n"
        
        cursor.execute("""
            INSERT INTO counseling_reports (student_id, counselor_id, report_text, action_type, risk_score, ai_risk_report)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (student_id, current_user['id'], report_text, action_type, risk_score, risk_report))
        
        # Mark cycle as closed for this student (approved doc is handled)
        cursor.execute("DELETE FROM documents WHERE student_id = %s", (student_id,))
        
        conn.commit()
        return jsonify({'message': 'Report submitted successfully'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# --- Student Report View ---
@api_bp.route('/student/my-reports', methods=['GET'])
@token_required
@role_required('student')
def get_my_reports(current_user):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM counseling_reports WHERE student_id = %s ORDER BY created_at DESC", (current_user['id'],))
    reports = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(reports), 200

# --- Hostel Manager APIs ---

@api_bp.route('/hostel/optimize-rooms', methods=['POST'])
@token_required
@role_required('hostel_manager')
def optimize_rooms(current_user):
    # Mock logic for "Room Merger" optimization (3-bed logic)
    # In a real app, this would query room_allocations and update room_id
    return jsonify({
        'message': 'Optimization complete! Consolidated 5 partially filled rooms into 2 full rooms. 3 vacant rooms powered down.',
        'saved_energy_kwh': 120
    }), 200

@api_bp.route('/hostel/mess-status', methods=['GET'])
@token_required
@role_required('hostel_manager')
def get_mess_status(current_user):
    return jsonify({
        'total_students': 1500,
        'mess_attendance': 1240,
        'status': 'Good',
        'report_date': '2026-03-14'
    }), 200
