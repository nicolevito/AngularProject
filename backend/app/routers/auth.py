from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.deps import get_current_user
from app.models import Usuario
from app.schemas import LoginRapidoRequest, LoginRequest, TokenResponse, UsuarioOut
from app.security import criar_token, verificar_senha

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(dados: LoginRequest, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    resultado = await db.execute(select(Usuario).where(Usuario.email == dados.email.lower(), Usuario.ativo.is_(True)))
    usuario = resultado.scalar_one_or_none()
    if usuario is None or not verificar_senha(dados.senha, usuario.senha_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="E-mail ou senha inválidos.")

    token = criar_token(sub=usuario.id, role=usuario.role.value, cliente_id=usuario.cliente_id)
    return TokenResponse(access_token=token, usuario=UsuarioOut.model_validate(usuario))


@router.post("/login-rapido", response_model=TokenResponse)
async def login_rapido(dados: LoginRapidoRequest, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    if not settings.allow_demo_login:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Login rápido desabilitado.")

    resultado = await db.execute(
        select(Usuario).where(Usuario.role == dados.role, Usuario.ativo.is_(True)).limit(1)
    )
    usuario = resultado.scalar_one_or_none()
    if usuario is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f'Nenhum usuário demo com papel "{dados.role.value}".',
        )

    token = criar_token(sub=usuario.id, role=usuario.role.value, cliente_id=usuario.cliente_id)
    return TokenResponse(access_token=token, usuario=UsuarioOut.model_validate(usuario))


@router.get("/me", response_model=UsuarioOut)
async def me(usuario: Usuario = Depends(get_current_user)) -> UsuarioOut:
    return UsuarioOut.model_validate(usuario)
