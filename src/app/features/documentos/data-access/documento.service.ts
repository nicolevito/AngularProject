import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Documento } from '../../../core/models';
import { MockDbService } from '../../../core/mock-data/mock-db.service';

@Injectable({ providedIn: 'root' })
export class DocumentoService {
  private readonly mockDb = inject(MockDbService);

  readonly documentos = this.mockDb.documentos.items;

  list(): Observable<Documento[]> {
    return this.mockDb.documentos.list();
  }

  getById(id: string): Observable<Documento | undefined> {
    return this.mockDb.documentos.getById(id);
  }

  upload(dados: {
    processoId: string;
    nome: string;
    tipo: Documento['tipo'];
    tamanhoBytes: number;
    uploadPor: string;
  }): Observable<Documento> {
    const agora = new Date().toISOString();
    return this.mockDb.documentos
      .create({
        ...dados,
        versao: 1,
        versoes: [{ versao: 1, dataUpload: agora, usuarioId: dados.uploadPor }],
        criadoEm: agora,
      })
      .pipe(
        switchMap((documento) =>
          this.mockDb.processos
            .update(dados.processoId, {
              documentoIds: [
                ...(this.mockDb.processos.items().find((p) => p.id === dados.processoId)?.documentoIds ?? []),
                documento.id,
              ],
            })
            .pipe(map(() => documento)),
        ),
      );
  }

  adicionarVersao(id: string, usuarioId: string): Observable<Documento> {
    const documento = this.mockDb.documentos.items().find((d) => d.id === id);
    if (!documento) throw new Error(`Documento ${id} não encontrado.`);

    const novaVersao = documento.versao + 1;
    return this.mockDb.documentos.update(id, {
      versao: novaVersao,
      versoes: [...documento.versoes, { versao: novaVersao, dataUpload: new Date().toISOString(), usuarioId }],
    });
  }

  remove(id: string): Observable<void> {
    return this.mockDb.documentos.remove(id);
  }
}
