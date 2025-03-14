from database import create_admin, update_admin_password, get_admin_by_username

def reset_admin():
    username = "admin"
    password = "admin_password"  # Change this to your desired password
    
    # Check if admin exists
    admin = get_admin_by_username(username)
    if admin:
        # Update existing admin
        if update_admin_password(username, password):
            print("Admin password updated successfully")
        else:
            print("Failed to update admin password")
    else:
        # Create new admin
        if create_admin(username, password):
            print("Admin created successfully")
        else:
            print("Failed to create admin")

if __name__ == "__main__":
    reset_admin()