from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError

from app.config import settings
from app.database import SessionLocal
from app.routers import admin, audiencias, auth, cep, clientes, documentos, faturas, prazos, processos
from app.seed import semear_se_vazio


@asynccontextmanager
async def lifespan(_: FastAPI):
    async with SessionLocal() as db:
        semeou = await semear_se_vazio(db)
        if semeou:
            print("Banco vazio — dados de demonstração semeados.")
    yield


app = FastAPI(title="Escritório de Advocacia API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(IntegrityError)
async def tratar_integridade(_: Request, exc: IntegrityError) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"detail": "Operação viola uma restrição de integridade referencial."},
    )


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(auth.router)
app.include_router(clientes.router)
app.include_router(processos.router)
app.include_router(prazos.router)
app.include_router(audiencias.router)
app.include_router(documentos.router)
app.include_router(faturas.router)
app.include_router(cep.router)
app.include_router(admin.router)
