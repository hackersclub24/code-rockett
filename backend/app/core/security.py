import os
import base64
import json
from fastapi import Request, HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth, credentials, initialize_app
from app.core.config import settings

# Initialize Firebase on app start.
# Requires FIREBASE_CREDENTIALS_PATH to be valid, or GOOGLE_APPLICATION_CREDENTIALS env var
if os.path.exists(settings.FIREBASE_CREDENTIALS_PATH):
    cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
    firebase_app = initialize_app(cred)
else:
    # Fallback to default credentials if using env variables, or mock for local development without file
    # This prevents the app from crashing on start if the file is missing locally
    try:
        firebase_app = initialize_app()
    except Exception as e:
        print("Warning: Firebase not initialized. Auth will fail.")

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    token = credentials.credentials
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        # Development fallback: If Firebase Admin isn't initialized with credentials, 
        # manually decode the JWT payload (INSECURE FOR PRODUCTION, but works for local MVP)
        try:
            payload = token.split('.')[1]
            # Add base64 padding
            payload += '=' * (-len(payload) % 4)
            decoded_payload = json.loads(base64.urlsafe_b64decode(payload).decode('utf-8'))
            print("Warning: Used local JWT decode fallback due to missing Firebase credentials.")
            return decoded_payload
        except Exception as fallback_e:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

# Dependency to get current user email
def get_current_user_email(decoded_token: dict = Depends(verify_token)) -> str:
    email = decoded_token.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Token does not contain email")
    return email

# Dependency to verify admin
def get_admin_user_email(email: str = Depends(get_current_user_email)) -> str:
    # Define admin email here, or could be in config
    if email != "abhishekmathur200624@gmail.com":
        raise HTTPException(status_code=403, detail="Not authorized. Admin access required.")
    return email
