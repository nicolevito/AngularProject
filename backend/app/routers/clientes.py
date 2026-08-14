from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_user, require_roles
from app.models import Cliente, Role, Usuario
from app.schemas import ClienteIn, ClienteOut, ClienteUpdate, cliente_to_out

router = APIRouter(prefix="/clientes", tags=["clientes"])


def _aplicar_campos(cliente: Cliente, dados: ClienteIn) -> None:
    cliente.tipo = dados.tipo
    cliente.status = dados.status
    cliente.email = dados.email
    cliente.telefone = dados.telefone
    cliente.endereco_cep = dados.endereco.cep
    cliente.endereco_logradouro = dados.endereco.logradouro
    cliente.endereco_numero = dados.endereco.numero
    cliente.endereco_complemento = dados.endereco.complemento
    cliente.endereco_bairro = dados.endereco.bairro
    cliente.endereco_cidade = dados.endereco.cidade
    cliente.endereco_uf = dados.endereco.uf
    cliente.nome = dados.nome
    cliente.cpf = dados.cpf
    cliente.data_nascimento = dados.data_nascimento
    cliente.profissao = dados.profissao
    cliente.representante_legal_menor = dados.representante_legal_menor
    cliente.razao_social = dados.razao_social
    cliente.nome_fantasia = dados.nome_fantasia
    cliente.cnpj = dados.cnpj
    cliente.representante_legal = dados.representante_legal


@router.get("", response_model=list[ClienteOut])
async def listar(
    db: AsyncSession = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
) -> list[ClienteOut]:
    query = select(Cliente)
    if usuario.role == Role.cliente:
        query = query.where(Cliente.id == usuario.cliente_id)
    resultado = await db.execute(query.order_by(Cliente.criado_em.desc()))
    return [cliente_to_out(c) for c in resultado.scalars().all()]


@router.get("/{cliente_id}", response_model=ClienteOut)
async def obter(
    cliente_id: str,
    db: AsyncSession = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
) -> ClienteOut:
    cliente = await db.get(Cliente, cliente_id)
    if cliente is None or (usuario.role == Role.cliente and cliente.id != usuario.cliente_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente não encontrado.")
    return cliente_to_out(cliente)


@router.post("", response_model=ClienteOut, status_code=status.HTTP_201_CREATED)
async def criar(
    dados: ClienteIn,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(require_roles(Role.advogado, Role.estagiario)),
) -> ClienteOut:
    cliente = Cliente()
    _aplicar_campos(cliente, dados)
    db.add(cliente)
    await db.commit()
    await db.refresh(cliente)
    return cliente_to_out(cliente)


@router.put("/{cliente_id}", response_model=ClienteOut)
async def atualizar(
    cliente_id: str,
    dados: ClienteUpdate,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(require_roles(Role.advogado, Role.estagiario)),
) -> ClienteOut:
    cliente = await db.get(Cliente, cliente_id)
    if cliente is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente não encontrado.")
    _aplicar_campos(cliente, dados)
    await db.commit()
    await db.refresh(cliente)
    return cliente_to_out(cliente)


@router.delete("/{cliente_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remover(
    cliente_id: str,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(require_roles(Role.advogado)),
) -> None:
    cliente = await db.get(Cliente, cliente_id)
    if cliente is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente não encontrado.")
    await db.delete(cliente)
    try:
        await db.commit()
    except IntegrityError as erro:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Este cliente possui processos vinculados e não pode ser excluído.",
        ) from erro
