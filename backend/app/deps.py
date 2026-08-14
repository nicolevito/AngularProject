from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Role, Usuario
from app.security import decodificar_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


async def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> Usuario:
    erro_credenciais = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas ou ausentes.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if token is None:
        raise erro_credenciais

    try:
        payload = decodificar_token(token)
    except ValueError as erro:
        raise erro_credenciais from erro

    usuario_id = payload.get("sub")
    if usuario_id is None:
        raise erro_credenciais

    usuario = await db.get(Usuario, usuario_id)
    if usuario is None or not usuario.ativo:
        raise erro_credenciais
    return usuario


def require_roles(*roles: Role):
    async def verificador(usuario: Usuario = Depends(get_current_user)) -> Usuario:
        if usuario.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não tem permissão para acessar este recurso.",
            )
        return usuario

    return verificador
