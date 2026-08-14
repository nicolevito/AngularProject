import json
from datetime import date, datetime
from pathlib import Path

from sqlalchemy import insert, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    Andamento,
    Audiencia,
    Cliente,
    Documento,
    DocumentoVersao,
    Fatura,
    ItemFatura,
    Parte,
    Prazo,
    Processo,
    Usuario,
    novo_id,
    processo_documentos,
)
from app.security import hash_senha

SEED_PATH = Path(__file__).parent / "seed_data.json"

TABELAS_EM_ORDEM_DE_DEPENDENCIA = [
    "fatura_itens",
    "faturas",
    "audiencias",
    "prazos",
    "processo_documentos",
    "documento_versoes",
    "documentos",
    "andamentos",
    "partes",
    "processos",
    "usuarios",
    "clientes",
]


def _dt(valor: str) -> datetime:
    momento = datetime.fromisoformat(valor.replace("Z", "+00:00"))
    return momento.replace(tzinfo=None)


def _data(valor: str) -> date:
    return date.fromisoformat(valor[:10])


def _carregar_json() -> dict:
    with SEED_PATH.open(encoding="utf-8") as arquivo:
        return json.load(arquivo)


async def _semear(db: AsyncSession) -> None:
    dados = _carregar_json()

    clientes = [
        Cliente(
            id=c["id"],
            tipo=c["tipo"],
            status=c["status"],
            email=c["email"],
            telefone=c["telefone"],
            criado_em=_dt(c["criadoEm"]),
            nome=c.get("nome"),
            cpf=c.get("cpf"),
            data_nascimento=_data(c["dataNascimento"]) if c.get("dataNascimento") else None,
            profissao=c.get("profissao"),
            representante_legal_menor=c.get("representanteLegalMenor"),
            razao_social=c.get("razaoSocial"),
            nome_fantasia=c.get("nomeFantasia"),
            cnpj=c.get("cnpj"),
            representante_legal=c.get("representanteLegal"),
            endereco_cep=c["endereco"]["cep"],
            endereco_logradouro=c["endereco"]["logradouro"],
            endereco_numero=c["endereco"]["numero"],
            endereco_complemento=c["endereco"].get("complemento"),
            endereco_bairro=c["endereco"]["bairro"],
            endereco_cidade=c["endereco"]["cidade"],
            endereco_uf=c["endereco"]["uf"],
        )
        for c in dados["clientes"]
    ]
    db.add_all(clientes)
    await db.flush()

    usuarios = [
        Usuario(
            id=u["id"],
            nome=u["nome"],
            email=u["email"].lower(),
            senha_hash=hash_senha(u["senha"]),
            role=u["role"],
            cliente_id=u.get("clienteId"),
            ativo=u["ativo"],
        )
        for u in dados["usuarios"]
    ]
    db.add_all(usuarios)
    await db.flush()

    processos = [
        Processo(
            id=p["id"],
            numero_processo=p["numeroProcesso"],
            cliente_id=p["clienteId"],
            advogado_responsavel_id=p["advogadoResponsavelId"],
            area=p["area"],
            status=p["status"],
            vara=p["vara"],
            comarca=p["comarca"],
            valor_causa=p["valorCausa"],
            data_abertura=_data(p["dataAbertura"]),
            observacoes=p.get("observacoes"),
        )
        for p in dados["processos"]
    ]
    db.add_all(processos)
    await db.flush()

    partes = [
        Parte(id=parte["id"], processo_id=p["id"], nome=parte["nome"], tipo=parte["tipo"], documento=parte["documento"])
        for p in dados["processos"]
        for parte in p["partes"]
    ]
    andamentos = [
        Andamento(
            id=a["id"], processo_id=p["id"], data=_dt(a["data"]) if "T" in a["data"] else _dt(a["data"] + "T00:00:00"),
            descricao=a["descricao"], tipo=a["tipo"], autor_id=a["autorId"],
        )
        for p in dados["processos"]
        for a in p["andamentos"]
    ]
    db.add_all(partes + andamentos)
    await db.flush()

    documentos = [
        Documento(
            id=d["id"],
            processo_id=d["processoId"],
            nome=d["nome"],
            tipo=d["tipo"],
            tamanho_bytes=d["tamanhoBytes"],
            versao_atual=d["versao"],
            upload_por=d["uploadPor"],
            criado_em=_dt(d["criadoEm"]),
        )
        for d in dados["documentos"]
    ]
    db.add_all(documentos)
    await db.flush()

    versoes = [
        DocumentoVersao(id=novo_id(), documento_id=d["id"], versao=v["versao"], data_upload=_dt(v["dataUpload"]), usuario_id=v["usuarioId"])
        for d in dados["documentos"]
        for v in d["versoes"]
    ]
    db.add_all(versoes)

    associacoes = [
        {"processo_id": p["id"], "documento_id": doc_id}
        for p in dados["processos"]
        for doc_id in p.get("documentoIds", [])
    ]
    if associacoes:
        await db.execute(insert(processo_documentos), associacoes)
    await db.flush()

    prazos = [
        Prazo(
            id=pr["id"],
            processo_id=pr["processoId"],
            titulo=pr["titulo"],
            descricao=pr.get("descricao"),
            data_vencimento=_data(pr["dataVencimento"]),
            tipo=pr["tipo"],
            responsavel_id=pr["responsavelId"],
            concluido=pr["concluido"],
            data_conclusao=_dt(pr["dataConclusao"]) if pr.get("dataConclusao") else None,
        )
        for pr in dados["prazos"]
    ]
    db.add_all(prazos)

    audiencias = [
        Audiencia(
            id=au["id"],
            processo_id=au["processoId"],
            tipo=au["tipo"],
            data=_dt(au["data"]),
            local=au["local"],
            virtual=au["virtual"],
            link_video=au.get("linkVideo"),
            status=au["status"],
            advogado_id=au["advogadoId"],
        )
        for au in dados["audiencias"]
    ]
    db.add_all(audiencias)
    await db.flush()

    faturas = [
        Fatura(
            id=f["id"],
            cliente_id=f["clienteId"],
            processo_id=f.get("processoId"),
            numero=f["numero"],
            valor_total=f["valorTotal"],
            data_emissao=_data(f["dataEmissao"]),
            data_vencimento=_data(f["dataVencimento"]),
            data_pagamento=_data(f["dataPagamento"]) if f.get("dataPagamento") else None,
            status=f["status"],
            forma_pagamento=f.get("formaPagamento"),
        )
        for f in dados["faturas"]
    ]
    db.add_all(faturas)
    await db.flush()

    itens = [
        ItemFatura(id=novo_id(), fatura_id=f["id"], descricao=item["descricao"], valor=item["valor"])
        for f in dados["faturas"]
        for item in f["itens"]
    ]
    db.add_all(itens)

    await db.commit()


async def semear_se_vazio(db: AsyncSession) -> bool:
    resultado = await db.execute(select(Usuario.id).limit(1))
    if resultado.first() is not None:
        return False
    await _semear(db)
    return True


async def resetar_dados_demo(db: AsyncSession) -> None:
    tabelas = ", ".join(TABELAS_EM_ORDEM_DE_DEPENDENCIA)
    await db.execute(text(f"TRUNCATE TABLE {tabelas} CASCADE"))
    await db.commit()
    await _semear(db)
