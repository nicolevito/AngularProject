import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { simulateGet } from '../../core/mock-data/mock-http.util';

export interface EnderecoEncontrado {
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
}

/** Base simulada de CEPs (equivalente a um ViaCEP mockado), cobrindo os CEPs usados nos dados demo. */
const BASE_CEP: Record<string, EnderecoEncontrado> = {
  '01311000': { logradouro: 'Av. Paulista', bairro: 'Bela Vista', cidade: 'São Paulo', uf: 'SP' },
  '22071900': { logradouro: 'Av. Atlântica', bairro: 'Copacabana', cidade: 'Rio de Janeiro', uf: 'RJ' },
  '30130010': { logradouro: 'Rua da Bahia', bairro: 'Centro', cidade: 'Belo Horizonte', uf: 'MG' },
  '04571000': { logradouro: 'Av. Engenheiro Luís Carlos Berrini', bairro: 'Brooklin', cidade: 'São Paulo', uf: 'SP' },
  '90010000': { logradouro: 'Rua dos Andradas', bairro: 'Centro Histórico', cidade: 'Porto Alegre', uf: 'RS' },
  '80010000': { logradouro: 'Rua XV de Novembro', bairro: 'Centro', cidade: 'Curitiba', uf: 'PR' },
  '60165121': { logradouro: 'Av. Beira Mar', bairro: 'Meireles', cidade: 'Fortaleza', uf: 'CE' },
  '13010001': { logradouro: 'Av. Francisco Glicério', bairro: 'Centro', cidade: 'Campinas', uf: 'SP' },
  '05426100': { logradouro: 'Av. Faria Lima', bairro: 'Itaim Bibi', cidade: 'São Paulo', uf: 'SP' },
  '88010400': { logradouro: 'Rua Felipe Schmidt', bairro: 'Centro', cidade: 'Florianópolis', uf: 'SC' },
  '01310100': { logradouro: 'Av. Paulista', bairro: 'Bela Vista', cidade: 'São Paulo', uf: 'SP' },
  '20040020': { logradouro: 'Av. Rio Branco', bairro: 'Centro', cidade: 'Rio de Janeiro', uf: 'RJ' },
};

@Injectable({ providedIn: 'root' })
export class CepLookupService {
  buscar(cep: string): Observable<EnderecoEncontrado | null> {
    const chave = cep.replace(/\D/g, '');
    return simulateGet(BASE_CEP[chave] ?? null);
  }

  existe(cep: string): Observable<boolean> {
    return this.buscar(cep).pipe(map((endereco) => endereco !== null));
  }
}
