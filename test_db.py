from database import get_db_connection, close_db_connection

connection = get_db_connection()
if connection:
    print("Successfully connected to the database!")
    close_db_connection(connection)
else:
    print("Failed to connect to the database.")