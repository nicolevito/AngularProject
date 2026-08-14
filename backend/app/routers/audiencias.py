from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_user, require_roles
from app.models import Audiencia, Processo, Role, Usuario
from app.schemas import AudienciaIn, AudienciaOut, AudienciaUpdate

router = APIRouter(prefix="/audiencias", tags=["audiencias"])


def _aplicar_campos(audiencia: Audiencia, dados: AudienciaIn) -> None:
    audiencia.processo_id = dados.processo_id
    audiencia.tipo = dados.tipo
    audiencia.data = dados.data
    audiencia.local = dados.local
    audiencia.virtual = dados.virtual
    audiencia.link_video = dados.link_video
    audiencia.status = dados.status
    audiencia.advogado_id = dados.advogado_id


@router.get("", response_model=list[AudienciaOut])
async def listar(
    db: AsyncSession = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
) -> list[AudienciaOut]:
    query = select(Audiencia)
    if usuario.role == Role.cliente:
        query = query.join(Processo, Processo.id == Audiencia.processo_id).where(
            Processo.cliente_id == usuario.cliente_id
        )
    resultado = await db.execute(query.order_by(Audiencia.data.asc()))
    return [AudienciaOut.model_validate(a) for a in resultado.scalars().all()]


@router.get("/{audiencia_id}", response_model=AudienciaOut)
async def obter(
    audiencia_id: str, db: AsyncSession = Depends(get_db), _: Usuario = Depends(get_current_user)
) -> AudienciaOut:
    audiencia = await db.get(Audiencia, audiencia_id)
    if audiencia is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audiência não encontrada.")
    return AudienciaOut.model_validate(audiencia)


@router.post("", response_model=AudienciaOut, status_code=status.HTTP_201_CREATED)
async def criar(
    dados: AudienciaIn,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(require_roles(Role.advogado, Role.estagiario)),
) -> AudienciaOut:
    audiencia = Audiencia()
    _aplicar_campos(audiencia, dados)
    db.add(audiencia)
    await db.commit()
    await db.refresh(audiencia)
    return AudienciaOut.model_validate(audiencia)


@router.put("/{audiencia_id}", response_model=AudienciaOut)
async def atualizar(
    audiencia_id: str,
    dados: AudienciaUpdate,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(require_roles(Role.advogado, Role.estagiario)),
) -> AudienciaOut:
    audiencia = await db.get(Audiencia, audiencia_id)
    if audiencia is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audiência não encontrada.")
    _aplicar_campos(audiencia, dados)
    await db.commit()
    await db.refresh(audiencia)
    return AudienciaOut.model_validate(audiencia)


@router.delete("/{audiencia_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remover(
    audiencia_id: str,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(require_roles(Role.advogado, Role.estagiario)),
) -> None:
    audiencia = await db.get(Audiencia, audiencia_id)
    if audiencia is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audiência não encontrada.")
    await db.delete(audiencia)
    await db.commit()
