import httpx
from fastapi import APIRouter, Depends, HTTPException, status

from app.deps import get_current_user
from app.models import Usuario
from app.schemas import CepOut

router = APIRouter(prefix="/cep", tags=["cep"])


@router.get("/{cep}", response_model=CepOut)
async def buscar_cep(cep: str, _: Usuario = Depends(get_current_user)) -> CepOut:
    digitos = "".join(filter(str.isdigit, cep))
    if len(digitos) != 8:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="CEP deve ter 8 dígitos.")

    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            resposta = await client.get(f"https://viacep.com.br/ws/{digitos}/json/")
        except httpx.HTTPError as erro:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY, detail="Não foi possível consultar o CEP."
            ) from erro

    dados = resposta.json()
    if resposta.status_code != 200 or dados.get("erro"):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="CEP não encontrado.")

    return CepOut(
        cep=dados["cep"],
        logradouro=dados.get("logradouro", ""),
        bairro=dados.get("bairro", ""),
        cidade=dados.get("localidade", ""),
        uf=dados.get("uf", ""),
    )
