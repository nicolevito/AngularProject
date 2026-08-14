from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator
from pydantic.alias_generators import to_camel

from app.models import (
    AreaDireito,
    FormaPagamento,
    Role,
    StatusAudiencia,
    StatusCliente,
    StatusFatura,
    StatusProcesso,
    TipoAndamento,
    TipoAudiencia,
    TipoDocumento,
    TipoParte,
    TipoPessoa,
    TipoPrazo,
)


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)


# ---------------------------------------------------------------------------
# Auth / Usuario
# ---------------------------------------------------------------------------


class UsuarioOut(CamelModel):
    id: str
    nome: str
    email: str
    role: Role
    cliente_id: str | None = None
    avatar_url: str | None = None
    ativo: bool


class LoginRequest(BaseModel):
    email: EmailStr
    senha: str


class LoginRapidoRequest(BaseModel):
    role: Role


class TokenResponse(CamelModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioOut


# ---------------------------------------------------------------------------
# Cliente
# ---------------------------------------------------------------------------


class EnderecoSchema(CamelModel):
    cep: str
    logradouro: str
    numero: str
    complemento: str | None = None
    bairro: str
    cidade: str
    uf: str


class ClienteOut(CamelModel):
    id: str
    tipo: TipoPessoa
    status: StatusCliente
    email: str
    telefone: str
    endereco: EnderecoSchema
    criado_em: datetime

    nome: str | None = None
    cpf: str | None = None
    data_nascimento: date | None = None
    profissao: str | None = None
    representante_legal_menor: str | None = None

    razao_social: str | None = None
    nome_fantasia: str | None = None
    cnpj: str | None = None
    representante_legal: str | None = None


def cliente_to_out(cliente) -> ClienteOut:
    return ClienteOut(
        id=cliente.id,
        tipo=cliente.tipo,
        status=cliente.status,
        email=cliente.email,
        telefone=cliente.telefone,
        endereco=EnderecoSchema(
            cep=cliente.endereco_cep,
            logradouro=cliente.endereco_logradouro,
            numero=cliente.endereco_numero,
            complemento=cliente.endereco_complemento,
            bairro=cliente.endereco_bairro,
            cidade=cliente.endereco_cidade,
            uf=cliente.endereco_uf,
        ),
        criado_em=cliente.criado_em,
        nome=cliente.nome,
        cpf=cliente.cpf,
        data_nascimento=cliente.data_nascimento,
        profissao=cliente.profissao,
        representante_legal_menor=cliente.representante_legal_menor,
        razao_social=cliente.razao_social,
        nome_fantasia=cliente.nome_fantasia,
        cnpj=cliente.cnpj,
        representante_legal=cliente.representante_legal,
    )


class ClienteIn(CamelModel):
    tipo: TipoPessoa
    status: StatusCliente = StatusCliente.ativo
    email: str
    telefone: str
    endereco: EnderecoSchema

    nome: str | None = None
    cpf: str | None = None
    data_nascimento: date | None = None
    profissao: str | None = None
    representante_legal_menor: str | None = None

    razao_social: str | None = None
    nome_fantasia: str | None = None
    cnpj: str | None = None
    representante_legal: str | None = None

    @model_validator(mode="after")
    def validar_campos_por_tipo(self) -> "ClienteIn":
        if self.tipo == TipoPessoa.fisica:
            if not self.nome or not self.cpf or not self.data_nascimento:
                raise ValueError("Cliente pessoa física exige nome, cpf e dataNascimento.")
        else:
            if not self.razao_social or not self.cnpj or not self.representante_legal:
                raise ValueError("Cliente pessoa jurídica exige razaoSocial, cnpj e representanteLegal.")
        return self


class ClienteUpdate(ClienteIn):
    pass


# ---------------------------------------------------------------------------
# Processo
# ---------------------------------------------------------------------------


class ParteOut(CamelModel):
    id: str
    nome: str
    tipo: TipoParte
    documento: str


class ParteIn(CamelModel):
    nome: str
    tipo: TipoParte
    documento: str


class AndamentoOut(CamelModel):
    id: str
    data: datetime
    descricao: str
    tipo: TipoAndamento
    autor_id: str


class AndamentoIn(CamelModel):
    data: datetime
    descricao: str
    tipo: TipoAndamento
    autor_id: str


class ProcessoOut(CamelModel):
    id: str
    numero_processo: str
    cliente_id: str
    advogado_responsavel_id: str
    area: AreaDireito
    status: StatusProcesso
    vara: str
    comarca: str
    valor_causa: float
    data_abertura: date
    observacoes: str | None = None
    partes: list[ParteOut]
    andamentos: list[AndamentoOut]
    documento_ids: list[str]


def processo_to_out(processo) -> ProcessoOut:
    return ProcessoOut(
        id=processo.id,
        numero_processo=processo.numero_processo,
        cliente_id=processo.cliente_id,
        advogado_responsavel_id=processo.advogado_responsavel_id,
        area=processo.area,
        status=processo.status,
        vara=processo.vara,
        comarca=processo.comarca,
        valor_causa=float(processo.valor_causa),
        data_abertura=processo.data_abertura,
        observacoes=processo.observacoes,
        partes=[ParteOut.model_validate(p) for p in processo.partes],
        andamentos=[AndamentoOut.model_validate(a) for a in processo.andamentos],
        documento_ids=[d.id for d in processo.documentos],
    )


class ProcessoIn(CamelModel):
    numero_processo: str
    cliente_id: str
    advogado_responsavel_id: str
    area: AreaDireito
    status: StatusProcesso
    vara: str
    comarca: str
    valor_causa: float
    data_abertura: date
    observacoes: str | None = None
    partes: list[ParteIn] = Field(default_factory=list)
    andamentos: list[AndamentoIn] = Field(default_factory=list)


class ProcessoUpdate(ProcessoIn):
    pass


# ---------------------------------------------------------------------------
# Prazo
# ---------------------------------------------------------------------------


class PrazoOut(CamelModel):
    id: str
    processo_id: str
    titulo: str
    descricao: str | None = None
    data_vencimento: date
    tipo: TipoPrazo
    responsavel_id: str
    concluido: bool
    data_conclusao: datetime | None = None


class PrazoIn(CamelModel):
    processo_id: str
    titulo: str
    descricao: str | None = None
    data_vencimento: date
    tipo: TipoPrazo
    responsavel_id: str
    concluido: bool = False
    data_conclusao: datetime | None = None


class PrazoUpdate(PrazoIn):
    pass


# ---------------------------------------------------------------------------
# Audiencia
# ---------------------------------------------------------------------------


class AudienciaOut(CamelModel):
    id: str
    processo_id: str
    tipo: TipoAudiencia
    data: datetime
    local: str
    virtual: bool
    link_video: str | None = None
    status: StatusAudiencia
    advogado_id: str


class AudienciaIn(CamelModel):
    processo_id: str
    tipo: TipoAudiencia
    data: datetime
    local: str
    virtual: bool = False
    link_video: str | None = None
    status: StatusAudiencia
    advogado_id: str


class AudienciaUpdate(AudienciaIn):
    pass


# ---------------------------------------------------------------------------
# Documento
# ---------------------------------------------------------------------------


class VersaoDocumentoOut(CamelModel):
    versao: int
    data_upload: datetime
    usuario_id: str


class DocumentoOut(CamelModel):
    id: str
    processo_id: str
    nome: str
    tipo: TipoDocumento
    tamanho_bytes: int
    versao: int = Field(validation_alias="versao_atual")
    versoes: list[VersaoDocumentoOut]
    upload_por: str
    criado_em: datetime


class DocumentoIn(CamelModel):
    processo_id: str
    nome: str
    tipo: TipoDocumento
    tamanho_bytes: int
    upload_por: str


# ---------------------------------------------------------------------------
# Fatura
# ---------------------------------------------------------------------------


class ItemFaturaOut(CamelModel):
    descricao: str
    valor: float


class ItemFaturaIn(CamelModel):
    descricao: str
    valor: float


class FaturaOut(CamelModel):
    id: str
    cliente_id: str
    processo_id: str | None = None
    numero: str
    itens: list[ItemFaturaOut]
    valor_total: float
    data_emissao: date
    data_vencimento: date
    data_pagamento: date | None = None
    status: StatusFatura
    forma_pagamento: FormaPagamento | None = None


class FaturaIn(CamelModel):
    cliente_id: str
    processo_id: str | None = None
    numero: str
    itens: list[ItemFaturaIn]
    valor_total: float
    data_emissao: date
    data_vencimento: date
    status: StatusFatura = StatusFatura.pendente


class MarcarPagaRequest(CamelModel):
    forma_pagamento: FormaPagamento


# ---------------------------------------------------------------------------
# CEP
# ---------------------------------------------------------------------------


class CepOut(CamelModel):
    cep: str
    logradouro: str
    bairro: str
    cidade: str
    uf: str
