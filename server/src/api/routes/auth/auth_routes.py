from typing import Optional

from fastapi import APIRouter, Body, Cookie, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_db
from src.api.dependencies import get_current_user
from src.services.auth.auth_service import AuthService
from src.api.schemas.auth import (
    AuthSession,
    ForgotPasswordRequest,
    GoogleLoginRequest,
    RefreshTokenRequest,
    ResendVerificationRequest,
    ResetPasswordRequest,
    Token,
    UserCreate,
    UserLogin,
    UserResponse,
    VerifyEmailRequest,
)
from src.config import get_settings
from src.utils.security import ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS

router = APIRouter(prefix="/auth", tags=["auth"])

def _set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    settings = get_settings()
    secure = not settings.DEBUG
    response.set_cookie(
        key="token",
        value=access_token,
        httponly=True,
        secure=secure,
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=secure,
        samesite="lax",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/",
    )


@router.post("/login", response_model=AuthSession)
async def login(
    user_in: UserLogin,
    response: Response,
    session: AsyncSession = Depends(get_db)
):
    """
    Login user and return access token.
    """
    service = AuthService(session)
    token = await service.authenticate_user(user_in)
    _set_auth_cookies(response, token.access_token, token.refresh_token)
    return AuthSession(user=token.user)

@router.post("/google", response_model=AuthSession)
async def google_login(
    google_in: GoogleLoginRequest,
    response: Response,
    session: AsyncSession = Depends(get_db)
):
    """
    Login with Google and return access token.
    """
    service = AuthService(session)
    token = await service.authenticate_google_user(google_in)
    _set_auth_cookies(response, token.access_token, token.refresh_token)
    return AuthSession(user=token.user)

@router.post("/refresh", response_model=AuthSession)
async def refresh_token(
    response: Response,
    refresh_in: Optional[RefreshTokenRequest] = Body(default=None),
    refresh_token_cookie: Optional[str] = Cookie(default=None, alias="refresh_token"),
    session: AsyncSession = Depends(get_db)
):
    """
    Refresh access token using refresh token.
    """
    refresh_token_value = refresh_in.refresh_token if refresh_in else refresh_token_cookie
    if not refresh_token_value:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing refresh token")
    service = AuthService(session)
    token: Token = await service.refresh_access_token(refresh_token_value)
    _set_auth_cookies(response, token.access_token, token.refresh_token)
    return AuthSession(user=token.user)

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate,
    session: AsyncSession = Depends(get_db)
):
    """
    Register a new user.
    """
    service = AuthService(session)
    return await service.register_user(user_in)


@router.get("/me", response_model=UserResponse)
async def me(current_user=Depends(get_current_user)):
    return current_user


@router.post("/logout")
async def logout(response: Response):
    settings = get_settings()
    secure = not settings.DEBUG
    response.delete_cookie(key="token", path="/", httponly=True, secure=secure, samesite="lax")
    response.delete_cookie(key="refresh_token", path="/", httponly=True, secure=secure, samesite="lax")
    return {"detail": "Logged out"}

@router.post("/forgot-password")
async def forgot_password(
    payload: ForgotPasswordRequest,
    session: AsyncSession = Depends(get_db)
):
    service = AuthService(session)
    return await service.request_password_reset(payload.email)

@router.post("/reset-password")
async def reset_password(
    payload: ResetPasswordRequest,
    session: AsyncSession = Depends(get_db)
):
    service = AuthService(session)
    return await service.reset_password(payload.token, payload.new_password)

@router.post("/verify-email")
async def verify_email(
    payload: VerifyEmailRequest,
    session: AsyncSession = Depends(get_db)
):
    service = AuthService(session)
    return await service.verify_email(payload.token)

@router.post("/resend-verification")
async def resend_verification(
    payload: ResendVerificationRequest,
    session: AsyncSession = Depends(get_db)
):
    service = AuthService(session)
    return await service.resend_verification_email(payload.email)
