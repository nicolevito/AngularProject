from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_user
from app.models import Usuario
from app.schemas import UsuarioOut

router = APIRouter(prefix="/usuarios", tags=["usuarios"])


@router.get("", response_model=list[UsuarioOut])
async def listar(
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(get_current_user),
) -> list[UsuarioOut]:
    resultado = await db.execute(select(Usuario).where(Usuario.ativo.is_(True)).order_by(Usuario.nome))
    return [UsuarioOut.model_validate(u) for u in resultado.scalars().all()]
