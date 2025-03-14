import mysql.connector
from mysql.connector import Error
from config import MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DB
import bcrypt

def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=MYSQL_HOST,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            database=MYSQL_DB
        )
        if connection.is_connected():
            return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

def close_db_connection(connection):
    if connection and connection.is_connected():
        connection.close()

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def check_password(password, hashed):
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_user(username, email, password):
    hashed_password = hash_password(password)
    connection = get_db_connection()
    if not connection:
        return False

    try:
        cursor = connection.cursor()
        query = """
            INSERT INTO farmers (username, email, password)
            VALUES (%s, %s, %s)
        """
        cursor.execute(query, (username, email, hashed_password))
        connection.commit()
        return True
    except Error as e:
        print(f"Error creating user: {e}")
        return False
    finally:
        cursor.close()
        close_db_connection(connection)

def get_user_by_email(email):
    connection = get_db_connection()
    if not connection:
        return None

    try:
        cursor = connection.cursor(dictionary=True)
        query = "SELECT * FROM farmers WHERE email = %s"
        cursor.execute(query, (email,))
        user = cursor.fetchone()
        return user
    except Error as e:
        print(f"Error fetching user: {e}")
        return None
    finally:
        cursor.close()
        close_db_connection(connection)

def get_user_by_id(user_id):
    connection = get_db_connection()
    if not connection:
        return None

    try:
        cursor = connection.cursor(dictionary=True)
        query = "SELECT * FROM farmers WHERE id = %s"
        cursor.execute(query, (user_id,))
        user = cursor.fetchone()
        return user
    except Error as e:
        print(f"Error fetching user: {e}")
        return None
    finally:
        cursor.close()
        close_db_connection(connection)

def get_admin_by_username(username):
    connection = get_db_connection()
    if not connection:
        return None

    try:
        cursor = connection.cursor(dictionary=True)
        query = "SELECT * FROM admins WHERE username = %s"
        cursor.execute(query, (username,))
        admin = cursor.fetchone()
        return admin
    except Error as e:
        print(f"Error fetching admin: {e}")
        return None
    finally:
        cursor.close()
        close_db_connection(connection)

def get_admin_by_id(admin_id):
    connection = get_db_connection()
    if not connection:
        return None

    try:
        cursor = connection.cursor(dictionary=True)
        query = "SELECT * FROM admins WHERE id = %s"
        cursor.execute(query, (admin_id,))
        admin = cursor.fetchone()
        return admin
    except Error as e:
        print(f"Error fetching admin: {e}")
        return None
    finally:
        cursor.close()
        close_db_connection(connection)

def update_user_status(user_id, is_approved=None, is_suspended=None):
    connection = get_db_connection()
    if not connection:
        return False

    try:
        cursor = connection.cursor()
        updates = []
        params = []
        if is_approved is not None:
            updates.append("is_approved = %s")
            params.append(is_approved)
        if is_suspended is not None:
            updates.append("is_suspended = %s")
            params.append(is_suspended)
        params.append(user_id)
        query = f"UPDATE farmers SET {', '.join(updates)} WHERE id = %s"
        cursor.execute(query, params)
        connection.commit()
        return True
    except Error as e:
        print(f"Error updating user status: {e}")
        return False
    finally:
        cursor.close()
        close_db_connection(connection)

def delete_user(user_id):
    connection = get_db_connection()
    if not connection:
        return False

    try:
        cursor = connection.cursor()
        query = "DELETE FROM farmers WHERE id = %s"
        cursor.execute(query, (user_id,))
        connection.commit()
        return True
    except Error as e:
        print(f"Error deleting user: {e}")
        return False
    finally:
        cursor.close()
        close_db_connection(connection)

def get_all_farmers():
    connection = get_db_connection()
    if not connection:
        return None

    try:
        cursor = connection.cursor(dictionary=True)
        query = "SELECT id, username, email, is_approved, is_suspended FROM farmers"
        cursor.execute(query)
        farmers = cursor.fetchall()
        return farmers
    except Error as e:
        print(f"Error fetching all farmers: {e}")
        return None
    finally:
        cursor.close()
        close_db_connection(connection)

def save_soil_data(farmer_id, nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall, moisture=None, soil_type=None):
    connection = get_db_connection()
    if not connection:
        return False

    try:
        cursor = connection.cursor()
        query = """
            INSERT INTO soil_data (farmer_id, nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall, moisture, soil_type)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (farmer_id, nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall, moisture, soil_type))
        connection.commit()
        return True
    except Error as e:
        print(f"Error saving soil data: {e}")
        return False
    finally:
        cursor.close()
        close_db_connection(connection)

def get_soil_data(farmer_id):
    connection = get_db_connection()
    if not connection:
        return None

    try:
        cursor = connection.cursor(dictionary=True)
        query = "SELECT * FROM soil_data WHERE farmer_id = %s ORDER BY created_at DESC LIMIT 1"
        cursor.execute(query, (farmer_id,))
        soil_data = cursor.fetchone()
        return soil_data
    except Error as e:
        print(f"Error fetching soil data: {e}")
        return None
    finally:
        cursor.close()
        close_db_connection(connection)

def get_soil_history(farmer_id):
    connection = get_db_connection()
    if not connection:
        return None

    try:
        cursor = connection.cursor(dictionary=True)
        query = "SELECT * FROM soil_data WHERE farmer_id = %s ORDER BY created_at DESC"
        cursor.execute(query, (farmer_id,))
        soil_history = cursor.fetchall()
        return soil_history
    except Error as e:
        print(f"Error fetching soil history: {e}")
        return None
    finally:
        cursor.close()
        close_db_connection(connection)

def save_recommendation(farmer_id, crop, fertilizer):
    connection = get_db_connection()
    if not connection:
        return False

    try:
        cursor = connection.cursor()
        query = """
            INSERT INTO recommendations (farmer_id, crop, fertilizer, created_at)
            VALUES (%s, %s, %s, NOW())
        """
        cursor.execute(query, (farmer_id, crop, fertilizer))
        connection.commit()
        return True
    except Error as e:
        print(f"Error saving recommendation: {e}")
        return False
    finally:
        cursor.close()
        close_db_connection(connection)

def get_recommendation_history(farmer_id):
    connection = get_db_connection()
    if not connection:
        return None

    try:
        cursor = connection.cursor(dictionary=True)
        query = "SELECT * FROM recommendations WHERE farmer_id = %s ORDER BY created_at DESC"
        cursor.execute(query, (farmer_id,))
        history = cursor.fetchall()
        return history
    except Error as e:
        print(f"Error fetching recommendation history: {e}")
        return None
    finally:
        cursor.close()
        close_db_connection(connection)

def get_paired_history(farmer_id):
    connection = get_db_connection()
    if not connection:
        return []

    cursor = None
    try:
        cursor = connection.cursor(dictionary=True)  # Changed from mysql.cursors.DictCursor
        query = """
            SELECT 
                s.created_at AS date,
                s.nitrogen, s.phosphorus, s.potassium, s.temperature, s.humidity, s.ph, s.rainfall, s.moisture, s.soil_type,
                r.crop, r.fertilizer
            FROM soil_data s
            LEFT JOIN recommendations r ON s.farmer_id = r.farmer_id 
                AND s.created_at = r.created_at
            WHERE s.farmer_id = %s
            ORDER BY s.created_at DESC
        """
        cursor.execute(query, (farmer_id,))
        results = cursor.fetchall()
        return results
    except Error as e:
        print(f"Error fetching paired history: {e}")
        return []
    finally:
        if cursor:
            cursor.close()
        close_db_connection(connection)