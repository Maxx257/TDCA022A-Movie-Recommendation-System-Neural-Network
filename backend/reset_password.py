from getpass import getpass

from pwdlib import PasswordHash
from sqlalchemy import select

from app.database import SessionLocal
from app.models.user import User


password_hash = PasswordHash.recommended()

db = SessionLocal()

try:
    user = db.scalar(
        select(User).where(User.id == 1)
    )

    if user is None:
        print("User ID 1 not found.")
    else:
        print(f"Resetting password for: {user.username}")

        new_password = getpass("Enter new password: ")
        confirm_password = getpass("Confirm new password: ")

        if new_password != confirm_password:
            print("Passwords do not match.")
        elif len(new_password) < 8:
            print("Password must be at least 8 characters.")
        else:
            user.hashed_password = password_hash.hash(
                new_password
            )

            db.commit()

            print("Password reset successfully.")

finally:
    db.close()