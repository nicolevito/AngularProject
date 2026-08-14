from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import require_roles
from app.models import Role, Usuario
from app.seed import resetar_dados_demo

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/resetar-demo", status_code=204)
async def resetar_demo(
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(require_roles(Role.advogado)),
) -> None:
    await resetar_dados_demo(db)
