from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.deps import get_current_user, require_roles
from app.models import Andamento, Parte, Processo, Role, Usuario, novo_id
from app.schemas import AndamentoIn, ProcessoIn, ProcessoOut, ProcessoUpdate, processo_to_out

router = APIRouter(prefix="/processos", tags=["processos"])

CARREGAR_RELACOES = (
    selectinload(Processo.partes),
    selectinload(Processo.andamentos),
    selectinload(Processo.documentos),
)


async def _buscar(db: AsyncSession, processo_id: str) -> Processo | None:
    resultado = await db.execute(
        select(Processo).where(Processo.id == processo_id).options(*CARREGAR_RELACOES)
    )
    return resultado.scalar_one_or_none()


def _aplicar_campos(processo: Processo, dados: ProcessoIn) -> None:
    processo.numero_processo = dados.numero_processo
    processo.cliente_id = dados.cliente_id
    processo.advogado_responsavel_id = dados.advogado_responsavel_id
    processo.area = dados.area
    processo.status = dados.status
    processo.vara = dados.vara
    processo.comarca = dados.comarca
    processo.valor_causa = dados.valor_causa
    processo.data_abertura = dados.data_abertura
    processo.observacoes = dados.observacoes
    processo.partes = [Parte(nome=p.nome, tipo=p.tipo, documento=p.documento) for p in dados.partes]
    processo.andamentos = [
        Andamento(data=a.data, descricao=a.descricao, tipo=a.tipo, autor_id=a.autor_id) for a in dados.andamentos
    ]


@router.get("", response_model=list[ProcessoOut])
async def listar(
    db: AsyncSession = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
) -> list[ProcessoOut]:
    query = select(Processo).options(*CARREGAR_RELACOES)
    if usuario.role == Role.cliente:
        query = query.where(Processo.cliente_id == usuario.cliente_id)
    resultado = await db.execute(query.order_by(Processo.data_abertura.desc()))
    return [processo_to_out(p) for p in resultado.scalars().all()]


@router.get("/verificar-numero")
async def verificar_numero(
    numero: str,
    excluir_id: str | None = None,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(get_current_user),
) -> dict[str, bool]:
    query = select(Processo.id).where(Processo.numero_processo == numero)
    if excluir_id:
        query = query.where(Processo.id != excluir_id)
    resultado = await db.execute(query)
    return {"existe": resultado.first() is not None}


@router.get("/{processo_id}", response_model=ProcessoOut)
async def obter(
    processo_id: str,
    db: AsyncSession = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
) -> ProcessoOut:
    processo = await _buscar(db, processo_id)
    if processo is None or (usuario.role == Role.cliente and processo.cliente_id != usuario.cliente_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Processo não encontrado.")
    return processo_to_out(processo)


@router.post("", response_model=ProcessoOut, status_code=status.HTTP_201_CREATED)
async def criar(
    dados: ProcessoIn,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(require_roles(Role.advogado)),
) -> ProcessoOut:
    processo = Processo()
    _aplicar_campos(processo, dados)
    db.add(processo)
    try:
        await db.commit()
    except IntegrityError as erro:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Número de processo já cadastrado.") from erro
    processo = await _buscar(db, processo.id)
    return processo_to_out(processo)


@router.put("/{processo_id}", response_model=ProcessoOut)
async def atualizar(
    processo_id: str,
    dados: ProcessoUpdate,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(require_roles(Role.advogado)),
) -> ProcessoOut:
    processo = await _buscar(db, processo_id)
    if processo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Processo não encontrado.")
    _aplicar_campos(processo, dados)
    try:
        await db.commit()
    except IntegrityError as erro:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Número de processo já cadastrado.") from erro
    processo = await _buscar(db, processo_id)
    return processo_to_out(processo)


@router.post("/{processo_id}/andamentos", response_model=ProcessoOut)
async def adicionar_andamento(
    processo_id: str,
    dados: AndamentoIn,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(require_roles(Role.advogado, Role.estagiario)),
) -> ProcessoOut:
    processo = await _buscar(db, processo_id)
    if processo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Processo não encontrado.")
    andamento = Andamento(
        id=novo_id(), processo_id=processo_id, data=dados.data, descricao=dados.descricao,
        tipo=dados.tipo, autor_id=dados.autor_id,
    )
    db.add(andamento)
    await db.commit()
    processo = await _buscar(db, processo_id)
    return processo_to_out(processo)


@router.delete("/{processo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remover(
    processo_id: str,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(require_roles(Role.advogado)),
) -> None:
    processo = await db.get(Processo, processo_id)
    if processo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Processo não encontrado.")
    await db.delete(processo)
    try:
        await db.commit()
    except IntegrityError as erro:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Este processo possui registros vinculados (prazos, audiências, faturas ou documentos) e não pode ser excluído.",
        ) from erro
