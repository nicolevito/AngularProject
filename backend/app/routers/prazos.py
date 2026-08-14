from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_user, require_roles
from app.models import Prazo, Processo, Role, Usuario
from app.schemas import PrazoIn, PrazoOut, PrazoUpdate
from app.utils import agora_utc

router = APIRouter(prefix="/prazos", tags=["prazos"])


def _aplicar_campos(prazo: Prazo, dados: PrazoIn) -> None:
    prazo.processo_id = dados.processo_id
    prazo.titulo = dados.titulo
    prazo.descricao = dados.descricao
    prazo.data_vencimento = dados.data_vencimento
    prazo.tipo = dados.tipo
    prazo.responsavel_id = dados.responsavel_id
    prazo.concluido = dados.concluido
    prazo.data_conclusao = dados.data_conclusao


@router.get("", response_model=list[PrazoOut])
async def listar(
    db: AsyncSession = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
) -> list[PrazoOut]:
    query = select(Prazo)
    if usuario.role == Role.cliente:
        query = query.join(Processo, Processo.id == Prazo.processo_id).where(
            Processo.cliente_id == usuario.cliente_id
        )
    resultado = await db.execute(query.order_by(Prazo.data_vencimento.asc()))
    return [PrazoOut.model_validate(p) for p in resultado.scalars().all()]


@router.get("/{prazo_id}", response_model=PrazoOut)
async def obter(
    prazo_id: str, db: AsyncSession = Depends(get_db), _: Usuario = Depends(get_current_user)
) -> PrazoOut:
    prazo = await db.get(Prazo, prazo_id)
    if prazo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prazo não encontrado.")
    return PrazoOut.model_validate(prazo)


@router.post("", response_model=PrazoOut, status_code=status.HTTP_201_CREATED)
async def criar(
    dados: PrazoIn,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(require_roles(Role.advogado, Role.estagiario)),
) -> PrazoOut:
    prazo = Prazo()
    _aplicar_campos(prazo, dados)
    db.add(prazo)
    await db.commit()
    await db.refresh(prazo)
    return PrazoOut.model_validate(prazo)


@router.put("/{prazo_id}", response_model=PrazoOut)
async def atualizar(
    prazo_id: str,
    dados: PrazoUpdate,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(require_roles(Role.advogado, Role.estagiario)),
) -> PrazoOut:
    prazo = await db.get(Prazo, prazo_id)
    if prazo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prazo não encontrado.")
    _aplicar_campos(prazo, dados)
    await db.commit()
    await db.refresh(prazo)
    return PrazoOut.model_validate(prazo)


@router.post("/{prazo_id}/concluir", response_model=PrazoOut)
async def concluir(
    prazo_id: str,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(require_roles(Role.advogado, Role.estagiario)),
) -> PrazoOut:
    prazo = await db.get(Prazo, prazo_id)
    if prazo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prazo não encontrado.")
    prazo.concluido = True
    prazo.data_conclusao = agora_utc()
    await db.commit()
    await db.refresh(prazo)
    return PrazoOut.model_validate(prazo)


@router.delete("/{prazo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remover(
    prazo_id: str,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(require_roles(Role.advogado, Role.estagiario)),
) -> None:
    prazo = await db.get(Prazo, prazo_id)
    if prazo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prazo não encontrado.")
    await db.delete(prazo)
    await db.commit()
