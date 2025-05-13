from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2AuthorizationCodeBearer
from models import user as m_user
from database import get_db

from google.oauth2 import id_token
from google.auth.transport.requests import Request

oauth_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl="https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl="https://oauth2.googleapis.com/token",
    scopes={"openid": "Google OpenID Connect"}
)


def current_user(
    token: str = Depends(oauth_scheme),
    db=Depends(get_db)
) -> m_user.User:
    try:
        info = id_token.verify_oauth2_token(token, Request())
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    user = db.query(m_user.User).filter_by(google_id=info["sub"]).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    return user
