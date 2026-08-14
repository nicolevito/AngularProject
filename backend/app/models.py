import enum
import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, Table, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def novo_id() -> str:
    return str(uuid.uuid4())


class Role(str, enum.Enum):
    advogado = "advogado"
    estagiario = "estagiario"
    cliente = "cliente"


class TipoPessoa(str, enum.Enum):
    fisica = "fisica"
    juridica = "juridica"


class StatusCliente(str, enum.Enum):
    ativo = "ativo"
    inativo = "inativo"


class StatusProcesso(str, enum.Enum):
    ativo = "ativo"
    suspenso = "suspenso"
    arquivado = "arquivado"
    encerrado = "encerrado"
    em_recurso = "em_recurso"


class AreaDireito(str, enum.Enum):
    civel = "civel"
    trabalhista = "trabalhista"
    tributario = "tributario"
    penal = "penal"
    familia = "familia"
    empresarial = "empresarial"


class TipoParte(str, enum.Enum):
    autor = "autor"
    reu = "reu"
    terceiro_interessado = "terceiro_interessado"


class TipoAndamento(str, enum.Enum):
    peticao = "peticao"
    decisao = "decisao"
    audiencia_marcada = "audiencia_marcada"
    movimentacao = "movimentacao"
    sentenca = "sentenca"
    outro = "outro"


class TipoPrazo(str, enum.Enum):
    recurso = "recurso"
    contestacao = "contestacao"
    manifestacao = "manifestacao"
    audiencia = "audiencia"
    pagamento = "pagamento"
    outro = "outro"


class TipoAudiencia(str, enum.Enum):
    conciliacao = "conciliacao"
    instrucao = "instrucao"
    julgamento = "julgamento"
    una = "una"


class StatusAudiencia(str, enum.Enum):
    agendada = "agendada"
    realizada = "realizada"
    cancelada = "cancelada"
    remarcada = "remarcada"


class TipoDocumento(str, enum.Enum):
    peticao = "peticao"
    contrato = "contrato"
    procuracao = "procuracao"
    sentenca = "sentenca"
    comprovante = "comprovante"
    outro = "outro"


class StatusFatura(str, enum.Enum):
    pendente = "pendente"
    paga = "paga"
    atrasada = "atrasada"
    cancelada = "cancelada"


class FormaPagamento(str, enum.Enum):
    pix = "pix"
    boleto = "boleto"
    cartao = "cartao"
    transferencia = "transferencia"


processo_documentos = Table(
    "processo_documentos",
    Base.metadata,
    Column("processo_id", String, ForeignKey("processos.id", ondelete="CASCADE"), primary_key=True),
    Column("documento_id", String, ForeignKey("documentos.id", ondelete="CASCADE"), primary_key=True),
)


class Usuario(Base):
    __tablename__ = "usuarios"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=novo_id)
    nome: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    senha_hash: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[Role] = mapped_column(nullable=False)
    cliente_id: Mapped[str | None] = mapped_column(ForeignKey("clientes.id", ondelete="SET NULL"), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String, nullable=True)
    ativo: Mapped[bool] = mapped_column(default=True, nullable=False)


class Cliente(Base):
    __tablename__ = "clientes"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=novo_id)
    tipo: Mapped[TipoPessoa] = mapped_column(nullable=False)
    status: Mapped[StatusCliente] = mapped_column(nullable=False, default=StatusCliente.ativo)
    email: Mapped[str] = mapped_column(String, nullable=False)
    telefone: Mapped[str] = mapped_column(String, nullable=False)
    criado_em: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Pessoa física
    nome: Mapped[str | None] = mapped_column(String, nullable=True)
    cpf: Mapped[str | None] = mapped_column(String, nullable=True)
    data_nascimento: Mapped[date | None] = mapped_column(Date, nullable=True)
    profissao: Mapped[str | None] = mapped_column(String, nullable=True)
    representante_legal_menor: Mapped[str | None] = mapped_column(String, nullable=True)

    # Pessoa jurídica
    razao_social: Mapped[str | None] = mapped_column(String, nullable=True)
    nome_fantasia: Mapped[str | None] = mapped_column(String, nullable=True)
    cnpj: Mapped[str | None] = mapped_column(String, nullable=True)
    representante_legal: Mapped[str | None] = mapped_column(String, nullable=True)

    # Endereço (1:1, embutido — sem motivo pra tabela própria)
    endereco_cep: Mapped[str] = mapped_column(String, nullable=False)
    endereco_logradouro: Mapped[str] = mapped_column(String, nullable=False)
    endereco_numero: Mapped[str] = mapped_column(String, nullable=False)
    endereco_complemento: Mapped[str | None] = mapped_column(String, nullable=True)
    endereco_bairro: Mapped[str] = mapped_column(String, nullable=False)
    endereco_cidade: Mapped[str] = mapped_column(String, nullable=False)
    endereco_uf: Mapped[str] = mapped_column(String, nullable=False)

    processos: Mapped[list["Processo"]] = relationship(back_populates="cliente", passive_deletes=True)


class Processo(Base):
    __tablename__ = "processos"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=novo_id)
    numero_processo: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    cliente_id: Mapped[str] = mapped_column(ForeignKey("clientes.id", ondelete="RESTRICT"), nullable=False)
    advogado_responsavel_id: Mapped[str] = mapped_column(ForeignKey("usuarios.id", ondelete="RESTRICT"), nullable=False)
    area: Mapped[AreaDireito] = mapped_column(nullable=False)
    status: Mapped[StatusProcesso] = mapped_column(nullable=False)
    vara: Mapped[str] = mapped_column(String, nullable=False)
    comarca: Mapped[str] = mapped_column(String, nullable=False)
    valor_causa: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    data_abertura: Mapped[date] = mapped_column(Date, nullable=False)
    observacoes: Mapped[str | None] = mapped_column(String, nullable=True)

    cliente: Mapped[Cliente] = relationship(back_populates="processos")
    partes: Mapped[list["Parte"]] = relationship(back_populates="processo", cascade="all, delete-orphan")
    andamentos: Mapped[list["Andamento"]] = relationship(back_populates="processo", cascade="all, delete-orphan")
    documentos: Mapped[list["Documento"]] = relationship(secondary=processo_documentos, back_populates="processos")


class Parte(Base):
    __tablename__ = "partes"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=novo_id)
    processo_id: Mapped[str] = mapped_column(ForeignKey("processos.id", ondelete="CASCADE"), nullable=False)
    nome: Mapped[str] = mapped_column(String, nullable=False)
    tipo: Mapped[TipoParte] = mapped_column(nullable=False)
    documento: Mapped[str] = mapped_column(String, nullable=False)

    processo: Mapped[Processo] = relationship(back_populates="partes")


class Andamento(Base):
    __tablename__ = "andamentos"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=novo_id)
    processo_id: Mapped[str] = mapped_column(ForeignKey("processos.id", ondelete="CASCADE"), nullable=False)
    data: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    descricao: Mapped[str] = mapped_column(String, nullable=False)
    tipo: Mapped[TipoAndamento] = mapped_column(nullable=False)
    autor_id: Mapped[str] = mapped_column(ForeignKey("usuarios.id", ondelete="RESTRICT"), nullable=False)

    processo: Mapped[Processo] = relationship(back_populates="andamentos")


class Prazo(Base):
    __tablename__ = "prazos"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=novo_id)
    processo_id: Mapped[str] = mapped_column(ForeignKey("processos.id", ondelete="CASCADE"), nullable=False)
    titulo: Mapped[str] = mapped_column(String, nullable=False)
    descricao: Mapped[str | None] = mapped_column(String, nullable=True)
    data_vencimento: Mapped[date] = mapped_column(Date, nullable=False)
    tipo: Mapped[TipoPrazo] = mapped_column(nullable=False)
    responsavel_id: Mapped[str] = mapped_column(ForeignKey("usuarios.id", ondelete="RESTRICT"), nullable=False)
    concluido: Mapped[bool] = mapped_column(default=False, nullable=False)
    data_conclusao: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class Audiencia(Base):
    __tablename__ = "audiencias"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=novo_id)
    processo_id: Mapped[str] = mapped_column(ForeignKey("processos.id", ondelete="CASCADE"), nullable=False)
    tipo: Mapped[TipoAudiencia] = mapped_column(nullable=False)
    data: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    local: Mapped[str] = mapped_column(String, nullable=False)
    virtual: Mapped[bool] = mapped_column(default=False, nullable=False)
    link_video: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[StatusAudiencia] = mapped_column(nullable=False)
    advogado_id: Mapped[str] = mapped_column(ForeignKey("usuarios.id", ondelete="RESTRICT"), nullable=False)


class Documento(Base):
    __tablename__ = "documentos"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=novo_id)
    processo_id: Mapped[str] = mapped_column(ForeignKey("processos.id", ondelete="CASCADE"), nullable=False)
    nome: Mapped[str] = mapped_column(String, nullable=False)
    tipo: Mapped[TipoDocumento] = mapped_column(nullable=False)
    tamanho_bytes: Mapped[int] = mapped_column(nullable=False)
    versao_atual: Mapped[int] = mapped_column(default=1, nullable=False)
    upload_por: Mapped[str] = mapped_column(ForeignKey("usuarios.id", ondelete="RESTRICT"), nullable=False)
    criado_em: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    versoes: Mapped[list["DocumentoVersao"]] = relationship(back_populates="documento", cascade="all, delete-orphan")
    processos: Mapped[list[Processo]] = relationship(secondary=processo_documentos, back_populates="documentos")


class DocumentoVersao(Base):
    __tablename__ = "documento_versoes"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=novo_id)
    documento_id: Mapped[str] = mapped_column(ForeignKey("documentos.id", ondelete="CASCADE"), nullable=False)
    versao: Mapped[int] = mapped_column(nullable=False)
    data_upload: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    usuario_id: Mapped[str] = mapped_column(ForeignKey("usuarios.id", ondelete="RESTRICT"), nullable=False)

    documento: Mapped[Documento] = relationship(back_populates="versoes")


class Fatura(Base):
    __tablename__ = "faturas"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=novo_id)
    cliente_id: Mapped[str] = mapped_column(ForeignKey("clientes.id", ondelete="RESTRICT"), nullable=False)
    processo_id: Mapped[str | None] = mapped_column(ForeignKey("processos.id", ondelete="SET NULL"), nullable=True)
    numero: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    valor_total: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    data_emissao: Mapped[date] = mapped_column(Date, nullable=False)
    data_vencimento: Mapped[date] = mapped_column(Date, nullable=False)
    data_pagamento: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[StatusFatura] = mapped_column(nullable=False)
    forma_pagamento: Mapped[FormaPagamento | None] = mapped_column(nullable=True)

    itens: Mapped[list["ItemFatura"]] = relationship(back_populates="fatura", cascade="all, delete-orphan")


class ItemFatura(Base):
    __tablename__ = "fatura_itens"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=novo_id)
    fatura_id: Mapped[str] = mapped_column(ForeignKey("faturas.id", ondelete="CASCADE"), nullable=False)
    descricao: Mapped[str] = mapped_column(String, nullable=False)
    valor: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)

    fatura: Mapped[Fatura] = relationship(back_populates="itens")
