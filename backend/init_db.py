import mysql.connector
from db import get_db_connection

def init_db():
    conn = get_db_connection()
    if not conn:
        print("Failed to connect to database.")
        return
    
    cursor = conn.cursor()
    
    with open('db_setup.sql', 'r') as f:
        sql_commands = f.read().split(';')
        
    for command in sql_commands:
        if command.strip():
            try:
                cursor.execute(command)
            except Exception as e:
                print(f"Error executing command: {command[:50]}... \n{e}")
    
    # Insert mock users
    users = [
        ('Admin User', 'admin@test.com', 'admin', 'admin'),
        ('Student User', 'student@test.com', 'student', 'student'),
        ('Counselor User', 'counselor@test.com', 'counselor', 'counselor'),
        ('Hostel Manager', 'hostel@test.com', 'hostel', 'hostel_manager')
    ]
    
    for name, email, password, role in users:
        try:
            cursor.execute("INSERT IGNORE INTO users (name, email, password_hash, role) VALUES (%s, %s, %s, %s)",
                           (name, email, password, role))
        except Exception as e:
            print(f"Error inserting user {email}: {e}")
            
    conn.commit()
    cursor.close()
    conn.close()
    print("Database initialized successfully.")

if __name__ == "__main__":
    init_db()
