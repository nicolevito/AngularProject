from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.deps import get_current_user, require_roles
from app.models import Fatura, ItemFatura, Role, StatusFatura, Usuario
from app.schemas import FaturaIn, FaturaOut, MarcarPagaRequest

router = APIRouter(prefix="/faturas", tags=["faturas"])

CARREGAR_ITENS = selectinload(Fatura.itens)


async def _buscar(db: AsyncSession, fatura_id: str) -> Fatura | None:
    resultado = await db.execute(select(Fatura).where(Fatura.id == fatura_id).options(CARREGAR_ITENS))
    return resultado.scalar_one_or_none()


@router.get("", response_model=list[FaturaOut])
async def listar(
    db: AsyncSession = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
) -> list[FaturaOut]:
    query = select(Fatura).options(CARREGAR_ITENS)
    if usuario.role == Role.cliente:
        query = query.where(Fatura.cliente_id == usuario.cliente_id)
    resultado = await db.execute(query.order_by(Fatura.data_emissao.desc()))
    return [FaturaOut.model_validate(f) for f in resultado.scalars().all()]


@router.get("/{fatura_id}", response_model=FaturaOut)
async def obter(
    fatura_id: str, db: AsyncSession = Depends(get_db), _: Usuario = Depends(get_current_user)
) -> FaturaOut:
    fatura = await _buscar(db, fatura_id)
    if fatura is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fatura não encontrada.")
    return FaturaOut.model_validate(fatura)


@router.post("", response_model=FaturaOut, status_code=status.HTTP_201_CREATED)
async def criar(
    dados: FaturaIn,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(require_roles(Role.advogado)),
) -> FaturaOut:
    fatura = Fatura(
        cliente_id=dados.cliente_id,
        processo_id=dados.processo_id,
        numero=dados.numero,
        valor_total=dados.valor_total,
        data_emissao=dados.data_emissao,
        data_vencimento=dados.data_vencimento,
        status=dados.status,
        itens=[ItemFatura(descricao=i.descricao, valor=i.valor) for i in dados.itens],
    )
    db.add(fatura)
    await db.commit()
    fatura = await _buscar(db, fatura.id)
    return FaturaOut.model_validate(fatura)


@router.post("/{fatura_id}/marcar-paga", response_model=FaturaOut)
async def marcar_paga(
    fatura_id: str,
    dados: MarcarPagaRequest,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(require_roles(Role.advogado)),
) -> FaturaOut:
    fatura = await _buscar(db, fatura_id)
    if fatura is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fatura não encontrada.")
    fatura.status = StatusFatura.paga
    fatura.data_pagamento = date.today()
    fatura.forma_pagamento = dados.forma_pagamento
    await db.commit()
    fatura = await _buscar(db, fatura_id)
    return FaturaOut.model_validate(fatura)


@router.post("/{fatura_id}/cancelar", response_model=FaturaOut)
async def cancelar(
    fatura_id: str,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(require_roles(Role.advogado)),
) -> FaturaOut:
    fatura = await _buscar(db, fatura_id)
    if fatura is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fatura não encontrada.")
    fatura.status = StatusFatura.cancelada
    await db.commit()
    fatura = await _buscar(db, fatura_id)
    return FaturaOut.model_validate(fatura)


@router.delete("/{fatura_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remover(
    fatura_id: str,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(require_roles(Role.advogado)),
) -> None:
    fatura = await db.get(Fatura, fatura_id)
    if fatura is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fatura não encontrada.")
    await db.delete(fatura)
    await db.commit()
