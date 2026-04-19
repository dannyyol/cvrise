from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status
import os
import secrets
from datetime import datetime, timezone
from google.oauth2 import id_token
from google.auth.transport import requests

from src.seeders.billing import BillingSeeder
from src.seeders.resumes import ResumeSeeder
from src.seeders.resume_data_migration import ResumeDataMigrationSeeder
from src.models.resume import Resume
from src.models.billing import UserBalance
from src.models.user import User
from src.models.enums import UserRole
from src.api.schemas.auth import UserCreate, UserLogin, Token, GoogleLoginRequest
from src.utils.security import get_password_hash, verify_password, create_access_token, create_refresh_token, SECRET_KEY, ALGORITHM, create_reset_token, verify_and_extract_reset_subject, create_verify_token, verify_and_extract_verify_subject
import jwt
from src.services.auth.email_service import send_email
from src.services.auth.email_templates import render_template
from src.config import get_settings

class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.resume_seeder = ResumeSeeder()
        self.resume_data_seeder = ResumeDataMigrationSeeder()
        self.billing_seeder = BillingSeeder()

    async def authenticate_user(self, user_in: UserLogin) -> Token:
        email = user_in.email.lower().strip()
        query = select(User).where(User.email == email)
        result = await self.db.execute(query)
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        if not verify_password(user_in.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not self._is_user_email_verified(user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Email not verified",
            )

        if not await self._is_user_workspace_ready(user.id):
            await self._provision_user_workspace(user.id)
            
        access_token = create_access_token(subject=user.id)
        refresh_token = create_refresh_token(subject=user.id)
        
        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            user=user
        )

    async def seed_new_user_data(self, user_id: str):
        """Seed initial data for a new user."""
        await self.resume_seeder.run(self.db, user_id=user_id, commit=False)
        await self.resume_data_seeder.run(self.db, user_id=user_id, commit=False)
        await self.billing_seeder.run(self.db, user_id=user_id, ensure_plans=False, commit=False)

    async def _provision_user_workspace(self, user_id: str) -> None:
        try:
            await self.seed_new_user_data(user_id)
            await self.db.commit()
        except RuntimeError as exc:
            await self.db.rollback()
            if str(exc) == "Missing required template: classic":
                raise HTTPException(status_code=503, detail="Workspace is initializing. Please try again.") from exc
            raise
        except Exception:
            await self.db.rollback()
            raise

    async def _is_user_workspace_ready(self, user_id: str) -> bool:
        resume_result = await self.db.execute(
            select(Resume).where(Resume.user_id == user_id, Resume.resume_data.isnot(None)).limit(1)
        )
        resume = resume_result.scalar_one_or_none()
        if not resume:
            return False

        balance_result = await self.db.execute(select(UserBalance).where(UserBalance.user_id == user_id).limit(1))
        balance = balance_result.scalar_one_or_none()
        return balance is not None

    @staticmethod
    def _is_user_email_verified(user: User) -> bool:
        return bool(user.email_verified_at) or user.is_active

    async def register_user(self, user_in: UserCreate) -> User:
        email = user_in.email.lower().strip()
        query = select(User).where(User.email == email)
        result = await self.db.execute(query)
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        hashed_password = get_password_hash(user_in.password)
        new_user = User(
            email=email,
            hashed_password=hashed_password,
            role=UserRole.USER,
            is_active=False,
        )
        
        self.db.add(new_user)
        await self.db.commit()
        await self.db.refresh(new_user)

        await self._send_verification_email(new_user)
        return new_user

    async def authenticate_google_user(self, google_in: GoogleLoginRequest) -> Token:
        try:
            client_id = os.getenv("GOOGLE_CLIENT_ID")
            
            id_info = id_token.verify_oauth2_token(
                google_in.token, 
                requests.Request(), 
                audience=client_id
            )

            email = id_info.get('email')
            if not email:
                raise ValueError("Email not found in token")
            
            email = email.lower().strip()

            query = select(User).where(User.email == email)
            result = await self.db.execute(query)
            user = result.scalar_one_or_none()

            if not user:
                random_password = secrets.token_urlsafe(32)
                hashed_password = get_password_hash(random_password)
                
                user = User(
                    email=email,
                    hashed_password=hashed_password,
                    role=UserRole.USER,
                    is_active=True,
                    email_verified_at=datetime.now(timezone.utc),
                )
                self.db.add(user)
                await self.db.flush()
                await self.db.refresh(user)
                await self._provision_user_workspace(user.id)
            elif not self._is_user_email_verified(user):
                user.is_active = True
                user.email_verified_at = datetime.now(timezone.utc)
                await self._provision_user_workspace(user.id)
            elif not await self._is_user_workspace_ready(user.id):
                await self._provision_user_workspace(user.id)

            access_token = create_access_token(subject=user.id)
            refresh_token = create_refresh_token(subject=user.id)
            
            return Token(
                access_token=access_token,
                refresh_token=refresh_token,
                token_type="bearer",
                user=user
            )

        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid Google token: {str(e)}",
                headers={"WWW-Authenticate": "Bearer"},
            )

    async def refresh_access_token(self, refresh_token: str) -> Token:
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        try:
            payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id: str = payload.get("sub")
            token_type: str = payload.get("type")

            if user_id is None or token_type != "refresh":
                raise credentials_exception

        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except jwt.PyJWTError:
            raise credentials_exception

        query = select(User).where(User.id == user_id)
        result = await self.db.execute(query)
        user = result.scalar_one_or_none()

        if not user or not self._is_user_email_verified(user):
            raise credentials_exception

        access_token = create_access_token(subject=user.id)
        new_refresh_token = create_refresh_token(subject=user.id)

        return Token(
            access_token=access_token,
            refresh_token=new_refresh_token,
            token_type="bearer",
            user=user
        )

    async def request_password_reset(self, email: str):
        normalized = email.lower().strip()
        query = select(User).where(User.email == normalized)
        result = await self.db.execute(query)
        user = result.scalar_one_or_none()
        if user:
            token = create_reset_token(subject=user.id)
            settings = get_settings()
            reset_url = f"{settings.CLIENT_BASE_URL}/reset-password?token={token}"
            subject = f"{settings.APP_NAME} password reset"
            html = render_template(
                "reset_password.html",
                {
                    "app_name": settings.APP_NAME,
                    "logo_url": f"{settings.CLIENT_BASE_URL}/images/blue-logo.png",
                    "reset_url": reset_url,
                    "user_email": user.email,
                },
            )
            text = f"Reset your password: {reset_url}"
            send_email(to_email=user.email, subject=subject, html=html, text=text)
        return {"detail": "If that email exists, we have sent a reset link"}

    async def reset_password(self, token: str, new_password: str):
        try:
            user_id = verify_and_extract_reset_subject(token)
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reset link expired")
        except jwt.PyJWTError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid reset token")

        query = select(User).where(User.id == user_id)
        result = await self.db.execute(query)
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid reset token")

        user.hashed_password = get_password_hash(new_password)
        await self.db.commit()
        return {"detail": "Password updated successfully"}

    async def _send_verification_email(self, user: User):
        settings = get_settings()
        token = create_verify_token(subject=user.id)
        verify_url = f"{settings.CLIENT_BASE_URL}/verify-email?token={token}"
        subject = f"{settings.APP_NAME} email verification"
        html = render_template(
            "verify_email.html",
            {
                "app_name": settings.APP_NAME,
                "logo_url": f"{settings.CLIENT_BASE_URL}/images/blue-logo.png",
                "verify_url": verify_url,
                "user_email": user.email,
            },
        )
        text = f"Verify your email: {verify_url}"
        send_email(to_email=user.email, subject=subject, html=html, text=text)

    async def verify_email(self, token: str):
        try:
            user_id = verify_and_extract_verify_subject(token)
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Verification link expired")
        except jwt.PyJWTError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid verification token")

        query = select(User).where(User.id == user_id)
        result = await self.db.execute(query)
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid verification token")

        if self._is_user_email_verified(user):
            return {"detail": "Email already verified"}

        user.is_active = True
        user.email_verified_at = datetime.now(timezone.utc)
        await self._provision_user_workspace(user.id)
        return {"detail": "Email verified successfully"}

    async def resend_verification_email(self, email: str):
        normalized = email.lower().strip()
        query = select(User).where(User.email == normalized)
        result = await self.db.execute(query)
        user = result.scalar_one_or_none()
        if user and not self._is_user_email_verified(user):
            await self._send_verification_email(user)
        return {"detail": "If that email exists, we have sent a verification link"}
