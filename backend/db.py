import mysql.connector
from mysql.connector import Error
import os

def get_db_connection():
    try:
        # Connect to XAMPP MySQL running on port 3308
        connection = mysql.connector.connect(
            host='localhost',
            port=3308,
            database='campus_intelligence',
            user='root',
            password=''
        )
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None
