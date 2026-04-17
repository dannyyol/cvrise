import bcrypt
from datetime import datetime, timedelta
from typing import Optional, Union, Any
import jwt

SECRET_KEY = "YOUR_SUPER_SECRET_KEY_CHANGE_IN_PRODUCTION"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7
RESET_TOKEN_EXPIRE_MINUTES = 30
VERIFY_TOKEN_EXPIRE_HOURS = 24

"""
Token helpers for auth flows.

SECRET_KEY is currently a static placeholder; production deployments should supply
their own secret and rotate it carefully, since it invalidates existing tokens.
"""

def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject), "type": "access"}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    to_encode = {"exp": expire, "sub": str(subject), "type": "refresh"}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_reset_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)
    to_encode = {"exp": expire, "sub": str(subject), "type": "reset"}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_and_extract_reset_subject(token: str) -> str:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    token_type: str = payload.get("type")
    if token_type != "reset":
        raise jwt.PyJWTError("invalid token type")
    user_id: str = payload.get("sub")
    if not user_id:
        raise jwt.PyJWTError("missing subject")
    return user_id

def create_verify_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=VERIFY_TOKEN_EXPIRE_HOURS)
    to_encode = {"exp": expire, "sub": str(subject), "type": "verify"}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_and_extract_verify_subject(token: str) -> str:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    token_type: str = payload.get("type")
    if token_type != "verify":
        raise jwt.PyJWTError("invalid token type")
    user_id: str = payload.get("sub")
    if not user_id:
        raise jwt.PyJWTError("missing subject")
    return user_id

def _get_safe_password_bytes(password: str) -> bytes:
    """
    Truncate password to 72 bytes to satisfy bcrypt limit.
    Returns bytes as bcrypt requires bytes input.
    """
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    return password_bytes

def verify_password(plain_password: str, hashed_password: str) -> bool:
    safe_password_bytes = _get_safe_password_bytes(plain_password)
    
    hashed_bytes = hashed_password.encode('utf-8') if isinstance(hashed_password, str) else hashed_password
    
    return bcrypt.checkpw(safe_password_bytes, hashed_bytes)

def get_password_hash(password: str) -> str:
    safe_password_bytes = _get_safe_password_bytes(password)
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(safe_password_bytes, salt)
    return hashed.decode('utf-8')
