from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.deps import get_current_user, require_roles
from app.models import Documento, DocumentoVersao, Processo, Role, Usuario, novo_id
from app.schemas import DocumentoIn, DocumentoOut
from app.utils import agora_utc

router = APIRouter(prefix="/documentos", tags=["documentos"])

CARREGAR_VERSOES = selectinload(Documento.versoes)


async def _buscar(db: AsyncSession, documento_id: str) -> Documento | None:
    resultado = await db.execute(
        select(Documento).where(Documento.id == documento_id).options(CARREGAR_VERSOES)
    )
    return resultado.scalar_one_or_none()


@router.get("", response_model=list[DocumentoOut])
async def listar(
    db: AsyncSession = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
) -> list[DocumentoOut]:
    query = select(Documento).options(CARREGAR_VERSOES)
    if usuario.role == Role.cliente:
        query = query.join(Processo, Processo.id == Documento.processo_id).where(
            Processo.cliente_id == usuario.cliente_id
        )
    resultado = await db.execute(query.order_by(Documento.criado_em.desc()))
    return [DocumentoOut.model_validate(d) for d in resultado.scalars().all()]


@router.get("/{documento_id}", response_model=DocumentoOut)
async def obter(
    documento_id: str, db: AsyncSession = Depends(get_db), _: Usuario = Depends(get_current_user)
) -> DocumentoOut:
    documento = await _buscar(db, documento_id)
    if documento is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Documento não encontrado.")
    return DocumentoOut.model_validate(documento)


@router.post("", response_model=DocumentoOut, status_code=status.HTTP_201_CREATED)
async def upload(
    dados: DocumentoIn,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(require_roles(Role.advogado, Role.estagiario)),
) -> DocumentoOut:
    processo = await db.get(Processo, dados.processo_id, options=[selectinload(Processo.documentos)])
    if processo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Processo não encontrado.")

    agora = agora_utc()
    documento = Documento(
        processo_id=dados.processo_id,
        nome=dados.nome,
        tipo=dados.tipo,
        tamanho_bytes=dados.tamanho_bytes,
        versao_atual=1,
        upload_por=dados.upload_por,
        criado_em=agora,
    )
    documento.versoes = [DocumentoVersao(id=novo_id(), versao=1, data_upload=agora, usuario_id=dados.upload_por)]
    db.add(documento)
    processo.documentos.append(documento)
    await db.commit()
    documento = await _buscar(db, documento.id)
    return DocumentoOut.model_validate(documento)


@router.post("/{documento_id}/versoes", response_model=DocumentoOut)
async def adicionar_versao(
    documento_id: str,
    usuario_id: str,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(require_roles(Role.advogado, Role.estagiario)),
) -> DocumentoOut:
    documento = await _buscar(db, documento_id)
    if documento is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Documento não encontrado.")
    documento.versao_atual += 1
    documento.versoes.append(
        DocumentoVersao(id=novo_id(), versao=documento.versao_atual, data_upload=agora_utc(), usuario_id=usuario_id)
    )
    await db.commit()
    documento = await _buscar(db, documento_id)
    return DocumentoOut.model_validate(documento)


@router.delete("/{documento_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remover(
    documento_id: str,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(require_roles(Role.advogado, Role.estagiario)),
) -> None:
    documento = await db.get(Documento, documento_id)
    if documento is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Documento não encontrado.")
    await db.delete(documento)
    await db.commit()
