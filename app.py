import io
import mysql
import pandas as pd
from flask import Flask, render_template, request, jsonify, make_response, send_file
import jwt
from datetime import datetime, timedelta
from config import SECRET_KEY, JWT_SECRET_KEY
from database import close_db_connection, get_db_connection, get_paired_history, get_user_by_email, create_user, check_password, get_admin_by_username, get_admin_by_id, get_user_by_id, save_soil_data, get_soil_data, update_user_status, delete_user, get_all_farmers, get_soil_history, save_recommendation, get_recommendation_history
import joblib
import numpy as np
import csv
from io import StringIO, BytesIO

app = Flask(__name__)
app.config['SECRET_KEY'] = SECRET_KEY

# Load Models
try:
    crop_model = joblib.load('models/crop_recommendation_model.joblib')
    fertilizer_model = joblib.load('models/fertilizer_recommendation_model.joblib')
    label_mapping = joblib.load('models/crop_label_mapping.joblib')
    print("Models loaded successfully!")
except Exception as e:
    print(f"Error loading models: {e}")
    crop_model = None
    fertilizer_model = None

# Reverse label mapping
CROP_LABELS = {v: k for k, v in label_mapping.items()} if label_mapping else {}


def verify_token(token):
    try:
        data = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
        return data
    except:
        return None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/register', methods=['GET'])
def register_page():
    return render_template('register.html')

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'error': 'Missing fields'}), 400

    existing_user = get_user_by_email(email)
    if existing_user:
        return jsonify({'error': 'Email already registered'}), 409

    if create_user(username, email, password):
        return jsonify({'message': 'Registration successful. You can now log in.'}), 201
    else:
        return jsonify({'error': 'Registration failed'}), 500

@app.route('/login', methods=['GET'])
def login_page():
    return render_template('login.html')

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Missing email or password'}), 400

    user = get_user_by_email(email)
    if not user or not check_password(password, user['password']):
        return jsonify({'error': 'Invalid email or password'}), 401

    if user['is_suspended']:
        return jsonify({'error': 'Account is suspended'}), 403

    token = jwt.encode({
        'user_id': user['id'],
        'role': 'farmer',
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, JWT_SECRET_KEY, algorithm='HS256')

    response = make_response(jsonify({'message': 'Login successful', 'token': token}))
    response.set_cookie('token', token, httponly=True, max_age=86400)
    return response

@app.route('/admin/login', methods=['GET'])
def admin_login_page():
    return render_template('admin_login.html')

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Missing username or password'}), 400

    admin = get_admin_by_username(username)
    if not admin or not check_password(password, admin['password']):
        return jsonify({'error': 'Invalid username or password'}), 401

    token = jwt.encode({
        'admin_id': admin['id'],
        'role': 'admin',
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, JWT_SECRET_KEY, algorithm='HS256')

    response = make_response(jsonify({'message': 'Admin login successful', 'token': token}))
    response.set_cookie('token', token, httponly=True, max_age=86400)
    return response

@app.route('/dashboard')
def dashboard():
    token = request.cookies.get('token')
    if not token:
        return jsonify({'error': 'Not authenticated'}), 401

    data = verify_token(token)
    if not data or data.get('role') != 'farmer':
        return jsonify({'error': 'Not authorized'}), 403

    user = get_user_by_id(data['user_id'])
    if not user:
        return jsonify({'error': 'User not found'}), 404

    soil_data = get_soil_data(user['id']) or {}
    soil_history = get_soil_history(user['id']) or []
    rec_history = get_recommendation_history(user['id']) or []
    return render_template('dashboard.html', user=user, soil_data=soil_data, soil_history=soil_history, rec_history=rec_history)

@app.route('/admin')
def admin_dashboard():
    token = request.cookies.get('token')
    if not token:
        return jsonify({'error': 'Not authenticated'}), 401

    data = verify_token(token)
    if not data or data.get('role') != 'admin':
        return jsonify({'error': 'Not authorized'}), 403

    admin = get_admin_by_id(data['admin_id'])
    if not admin:
        return jsonify({'error': 'Admin not found'}), 404

    farmers = get_all_farmers() or []
    return render_template('admin.html', admin=admin, farmers=farmers)

@app.route('/api/admin/manage-farmer', methods=['POST'])
def manage_farmer():
    token = request.cookies.get('token')
    if not token:
        return jsonify({'error': 'Not authenticated'}), 401

    data = verify_token(token)
    if not data or data.get('role') != 'admin':
        return jsonify({'error': 'Not authorized'}), 403

    action_data = request.get_json()
    user_id = action_data.get('user_id')
    action = action_data.get('action')

    if not user_id or not action:
        return jsonify({'error': 'Missing user_id or action'}), 400

    if action == 'approve':
        if update_user_status(user_id, is_approved=True):
            return jsonify({'message': 'Farmer approved successfully'}), 200
    elif action == 'reject':
        if update_user_status(user_id, is_approved=False):
            return jsonify({'message': 'Farmer rejected successfully'}), 200
    elif action == 'suspend':
        if update_user_status(user_id, is_suspended=True):
            return jsonify({'message': 'Farmer suspended successfully'}), 200
    elif action == 'unsuspend':
        if update_user_status(user_id, is_suspended=False):
            return jsonify({'message': 'Farmer unsuspended successfully'}), 200
    elif action == 'delete':
        if delete_user(user_id):
            return jsonify({'message': 'Farmer deleted successfully'}), 200

    return jsonify({'error': 'Action failed'}), 500

# ... (other imports and code remain unchanged)

@app.route('/api/soil-input', methods=['POST'])
def soil_input():
    token = request.cookies.get('token')
    # print(f"Received token from cookies: {token}")
    if not token:
        return jsonify({'error': 'Not authenticated'}), 401

    data = verify_token(token)
    # print(f"Decoded token data: {data}")
    if not data or data.get('role') != 'farmer':
        return jsonify({'error': 'Not authorized'}), 403

    user_id = data['user_id']
    input_data = request.get_json()
    required_fields = ['nitrogen', 'phosphorus', 'potassium', 'temperature', 'humidity', 'ph', 'rainfall']
    if not all(field in input_data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    optional_fields = {'moisture': None, 'soil_type': None}
    for field, default in optional_fields.items():
        input_data[field] = input_data.get(field, default)

    # Save soil data
    if save_soil_data(
        user_id,
        input_data['nitrogen'],
        input_data['phosphorus'],
        input_data['potassium'],
        input_data['temperature'],
        input_data['humidity'],
        input_data['ph'],
        input_data['rainfall'],
        input_data['moisture'],
        input_data['soil_type']
    ):
        # Get crop recommendation using the helper function
        crop = get_crop_recommendation(input_data)
        
        # Save only the crop recommendation (fertilizer will be saved later)
        save_recommendation(user_id, crop, None)  # Set fertilizer as None initially
        
        alert_message = check_soil_alerts(input_data)
        return jsonify({
            'message': 'Soil data saved successfully',
            'crop': crop,
            'alert': alert_message if alert_message else None
        }), 200
    else:
        return jsonify({'error': 'Failed to save soil data'}), 500

@app.route('/api/save-fertilizer-recommendation', methods=['POST'])
def save_fertilizer_recommendation_endpoint():
    token = request.cookies.get('token')
    if not token:
        return jsonify({'error': 'Not authenticated'}), 401

    data = verify_token(token)
    if not data or data.get('role') != 'farmer':
        return jsonify({'error': 'Not authorized'}), 403

    user_id = data['user_id']
    input_data = request.get_json()
    crop = input_data.get('crop')
    fertilizer = input_data.get('fertilizer')

    if not crop or not fertilizer:
        return jsonify({'error': 'Missing crop or fertilizer'}), 400

    # Update the latest recommendation entry for this user
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        cursor = connection.cursor()
        # Find the latest recommendation entry for this user
        query = """
            SELECT id FROM recommendations 
            WHERE farmer_id = %s AND fertilizer IS NULL 
            ORDER BY created_at DESC LIMIT 1
        """
        cursor.execute(query, (user_id,))
        result = cursor.fetchone()

        if result:
            # Update the existing entry with the fertilizer
            recommendation_id = result[0]
            update_query = """
                UPDATE recommendations 
                SET fertilizer = %s 
                WHERE id = %s
            """
            cursor.execute(update_query, (fertilizer, recommendation_id))
        else:
            # If no entry exists (unlikely since /api/soil-input creates one), create a new one
            save_recommendation(user_id, crop, fertilizer)

        connection.commit()
        return jsonify({'message': 'Fertilizer recommendation saved successfully'}), 200
    except csv.Error as e:
        print(f"Error saving fertilizer recommendation: {e}")
        return jsonify({'error': 'Failed to save fertilizer recommendation'}), 500
    finally:
        cursor.close()
        close_db_connection(connection)

def get_crop_recommendation(input_data):
    try:
        features = pd.DataFrame({
            "N": [input_data["nitrogen"]],
            "P": [input_data["phosphorus"]],
            "K": [input_data["potassium"]],
            "temperature": [input_data["temperature"]],
            "humidity": [input_data["humidity"]],
            "ph": [input_data["ph"]],
            "rainfall": [input_data["rainfall"]]
        })

        crop_index = crop_model.predict(features)[0]
        recommended_crop = CROP_LABELS.get(crop_index, "Unknown Crop")
        return str(recommended_crop).lower()  # Ensure it's a string
    except Exception as e:
        print(f"Error in crop prediction: {e}")
        return "Unknown Crop"

@app.route('/api/crop-recommendation', methods=['POST'])
def crop_recommendation():
    data = request.get_json()
    required_fields = ["nitrogen", "phosphorus", "potassium", "temperature", "humidity", "ph", "rainfall"]

    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        # Create features array with correct column names
        features = pd.DataFrame({
            "N": [data["nitrogen"]],
            "P": [data["phosphorus"]],
            "K": [data["potassium"]],
            "temperature": [data["temperature"]],
            "humidity": [data["humidity"]],
            "ph": [data["ph"]],
            "rainfall": [data["rainfall"]]
        })

        # Make prediction
        crop_index = crop_model.predict(features)[0]
        recommended_crop = CROP_LABELS.get(crop_index, "Unknown Crop")

        return jsonify({"crop": recommended_crop.lower()}), 200
    except Exception as e:
        print(f"Error in crop prediction: {e}")
        return jsonify({"error": "Failed to predict crop"}), 500

@app.route('/api/fertilizer-recommendation', methods=['POST'])
def fertilizer_recommendation():
    data = request.get_json()
    required_fields = ["nitrogen", "phosphorus", "potassium", "temperature", "humidity", "ph", "rainfall", "crop"]

    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        # Load label encoders
        label_encoders = joblib.load('models/label_encoders.joblib')
        
        # Create features DataFrame with correct column names
        features = pd.DataFrame({
            "Temparature": [data["temperature"]],
            "Humidity": [data["humidity"]],
            "Moisture": [data.get("moisture", 0)],
            "Soil_Type": [data.get("soil_type", "Loamy")],
            "Crop_Type": [data["crop"]],
            "Nitrogen": [data["nitrogen"]],
            "Potassium": [data["potassium"]],
            "Phosphorous": [data["phosphorus"]]
        })

        # Encode categorical variables
        features["Soil_Type"] = label_encoders["Soil_Type"].transform(features["Soil_Type"])
        features["Crop_Type"] = label_encoders["Crop_Type"].transform(features["Crop_Type"])

        # Predict fertilizer
        fertilizer_index = fertilizer_model.predict(features)[0]
        fertilizer_name = label_encoders["Fertilizer"].inverse_transform([fertilizer_index])[0]

        return jsonify({"fertilizer": fertilizer_name}), 200
    except Exception as e:
        print(f"Error in fertilizer prediction: {e}")
        return jsonify({"error": "Failed to predict fertilizer"}), 500

def check_soil_alerts(soil_data):
    alerts = []
    if soil_data['nitrogen'] < 20:
        alerts.append("Warning: Nitrogen levels are critically low!")
    if soil_data['phosphorus'] < 10:
        alerts.append("Warning: Phosphorus levels are critically low!")
    if soil_data['potassium'] < 15:
        alerts.append("Warning: Potassium levels are critically low!")
    if soil_data['ph'] < 5.5 or soil_data['ph'] > 7.5:
        alerts.append("Warning: pH is outside the optimal range (5.5-7.5)!")
    return "; ".join(alerts) if alerts else None

@app.route('/api/admin/all-data', methods=['GET'])
def get_all_data():
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500

    cursor = None
    try:
        cursor = connection.cursor(dictionary=True)  # Changed from mysql.cursors.DictCursor
        query = """
            SELECT 
                s.farmer_id,
                s.created_at AS date,
                s.nitrogen, s.phosphorus, s.potassium, 
                s.temperature, s.humidity, s.ph, s.rainfall, 
                s.moisture, s.soil_type,
                r.crop, r.fertilizer
            FROM soil_data s
            LEFT JOIN recommendations r ON s.farmer_id = r.farmer_id 
                AND s.created_at = r.created_at
            ORDER BY s.farmer_id, s.created_at DESC
        """
        cursor.execute(query)
        results = cursor.fetchall()
        return jsonify(results)
        
    except Exception as e:
        print(f"Error fetching all data: {e}")
        return jsonify({'error': 'Failed to fetch data'}), 500
    finally:
        if cursor:
            cursor.close()
        close_db_connection(connection)

@app.route('/api/export-data')
def export_data():
    token = request.cookies.get('token')
    if not token:
        return jsonify({'error': 'Not authenticated'}), 401

    data = verify_token(token)
    if not data:
        return jsonify({'error': 'Invalid token'}), 401

    user_id = data['user_id']
    soil_history = get_paired_history(user_id)
    
    # Get farming data
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        cursor = connection.cursor(dictionary=True)
        farming_query = """
            SELECT year, crop, fertilizer, output 
            FROM farming_data 
            WHERE farmer_id = %s 
            ORDER BY year DESC
        """
        cursor.execute(farming_query, (user_id,))
        farming_history = cursor.fetchall()

        # Create Excel-like CSV with multiple tables
        output = StringIO()
        writer = csv.writer(output)
        
        # Write Soil Data table
        writer.writerow(['SOIL AND RECOMMENDATION DATA'])
        writer.writerow(['Date', 'Nitrogen', 'Phosphorus', 'Potassium', 'Temperature', 
                        'Humidity', 'pH', 'Rainfall', 'Moisture', 'Soil Type',
                        'Recommended Crop', 'Recommended Fertilizer'])

        for record in soil_history:
            writer.writerow([
                record['date'],
                record['nitrogen'],
                record['phosphorus'],
                record['potassium'],
                record['temperature'],
                record['humidity'],
                record['ph'],
                record['rainfall'],
                record['moisture'],
                record['soil_type'],
                record['crop'],
                record['fertilizer']
            ])

        # Add space between tables
        writer.writerow([])
        writer.writerow([])
        writer.writerow([])

        # Write Farming Data table
        writer.writerow(['FARMING OUTPUT DATA'])
        writer.writerow(['Year', 'Crop', 'Fertilizer Used', 'Output (kg)'])

        for record in farming_history:
            writer.writerow([
                record['year'],
                record['crop'],
                record['fertilizer'],
                record['output']
            ])

        # Convert to bytes for file download
        output.seek(0)
        binary_output = BytesIO()
        binary_output.write(output.getvalue().encode('utf-8-sig'))
        binary_output.seek(0)

        return send_file(
            binary_output,
            mimetype='text/csv',
            download_name=f'farming_history_{user_id}.csv',
            as_attachment=True
        )

    except Exception as e:
        print(f"Error exporting data: {e}")
        return jsonify({'error': 'Failed to export data'}), 500
    finally:
        if connection:
            cursor.close()
            close_db_connection(connection)

@app.route('/api/save-farming-data', methods=['POST'])
def save_farming_data():
    token = request.cookies.get('token')
    if not token:
        return jsonify({'error': 'Not authenticated'}), 401

    data = verify_token(token)
    if not data or data.get('role') != 'farmer':
        return jsonify({'error': 'Not authorized'}), 403

    farming_data = request.get_json()
    year = farming_data.get('year')
    crop = farming_data.get('crop')
    fertilizer = farming_data.get('fertilizer')
    output = farming_data.get('output')

    if not year or not crop or not fertilizer or not output:
        return jsonify({'error': 'Missing fields'}), 400

    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        cursor = connection.cursor()
        query = """
            INSERT INTO farming_data (farmer_id, year, crop, fertilizer, output)
            VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(query, (data['user_id'], year, crop, fertilizer, output))
        connection.commit()
        return jsonify({'message': 'Farming data saved successfully'}), 200
    except csv.Error as e:
        print(f"Error saving farming data: {e}")
        return jsonify({'error': 'Failed to save farming data'}), 500
    finally:
        cursor.close()
        close_db_connection(connection)

@app.route('/api/get-farming-data', methods=['GET'])
def get_farming_data():
    token = request.cookies.get('token')
    if not token:
        return jsonify({'error': 'Not authenticated'}), 401

    data = verify_token(token)
    if not data or data.get('role') != 'farmer':
        return jsonify({'error': 'Not authorized'}), 403

    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        cursor = connection.cursor(dictionary=True)
        query = "SELECT id, year, crop, fertilizer, output FROM farming_data WHERE farmer_id = %s ORDER BY year DESC"
        cursor.execute(query, (data['user_id'],))
        farming_data = cursor.fetchall()
        return jsonify(farming_data)
    except Exception as e:
        print(f"Error fetching farming data: {e}")
        return jsonify({'error': 'Failed to fetch farming data'}), 500
    finally:
        cursor.close()
        close_db_connection(connection)

@app.route('/api/get-farming-data/<int:record_id>', methods=['GET'])
def get_farming_data_by_id(record_id):
    token = request.cookies.get('token')
    if not token:
        return jsonify({'error': 'Not authenticated'}), 401

    data = verify_token(token)
    if not data or data.get('role') != 'farmer':
        return jsonify({'error': 'Not authorized'}), 403

    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        cursor = connection.cursor(dictionary=True)
        query = "SELECT * FROM farming_data WHERE id = %s AND farmer_id = %s"
        cursor.execute(query, (record_id, data['user_id']))
        farming_data = cursor.fetchone()
        if farming_data:
            print(f"Fetched farming data for record ID {record_id}: {farming_data}")  # Debugging
            return jsonify(farming_data)
        else:
            print(f"Record ID {record_id} not found for farmer ID {data['user_id']}")  # Debugging
            return jsonify({'error': 'Record not found'}), 404
    except csv.Error as e:
        print(f"Error fetching farming data: {e}")
        return jsonify({'error': 'Failed to fetch farming data'}), 500
    finally:
        cursor.close()
        close_db_connection(connection)

@app.route('/api/update-farming-data/<int:record_id>', methods=['PUT'])
def update_farming_data(record_id):
    token = request.cookies.get('token')
    if not token:
        return jsonify({'error': 'Not authenticated'}), 401

    data = verify_token(token)
    if not data or data.get('role') != 'farmer':
        return jsonify({'error': 'Not authorized'}), 403

    farming_data = request.get_json()
    year = farming_data.get('year')
    crop = farming_data.get('crop')
    fertilizer = farming_data.get('fertilizer')
    output = farming_data.get('output')

    if not year or not crop or not fertilizer or not output:
        return jsonify({'error': 'Missing fields'}), 400

    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        cursor = connection.cursor()
        query = """
            UPDATE farming_data
            SET year = %s, crop = %s, fertilizer = %s, output = %s
            WHERE id = %s AND farmer_id = %s
        """
        cursor.execute(query, (year, crop, fertilizer, output, record_id, data['user_id']))
        connection.commit()
        return jsonify({'message': 'Farming data updated successfully'}), 200
    except csv.Error as e:
        print(f"Error updating farming data: {e}")
        return jsonify({'error': 'Failed to update farming data'}), 500
    finally:
        cursor.close()
        close_db_connection(connection)

@app.route('/api/delete-farming-data/<int:record_id>', methods=['DELETE'])
def delete_farming_data(record_id):
    token = request.cookies.get('token')
    if not token:
        return jsonify({'error': 'Not authenticated'}), 401

    data = verify_token(token)
    if not data or data.get('role') != 'farmer':
        return jsonify({'error': 'Not authorized'}), 403

    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        cursor = connection.cursor()
        query = "DELETE FROM farming_data WHERE id = %s AND farmer_id = %s"
        cursor.execute(query, (record_id, data['user_id']))
        connection.commit()
        return jsonify({'message': 'Farming data deleted successfully'}), 200
    except csv.Error as e:
        print(f"Error deleting farming data: {e}")
        return jsonify({'error': 'Failed to delete farming data'}), 500
    finally:
        cursor.close()
        close_db_connection(connection)

if __name__ == '__main__':
    app.run(debug=True)