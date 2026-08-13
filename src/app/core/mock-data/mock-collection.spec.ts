import { firstValueFrom } from 'rxjs';
import { MockCollection } from './mock-collection';

interface Item {
  id: string;
  nome: string;
}

const SEED: Item[] = [
  { id: 'seed-1', nome: 'Primeiro' },
  { id: 'seed-2', nome: 'Segundo' },
];

describe('MockCollection', () => {
  beforeEach(() => localStorage.clear());

  it('carrega o seed quando não há nada persistido', async () => {
    const colecao = new MockCollection<Item>('itens-teste', SEED);
    const itens = await firstValueFrom(colecao.list());
    expect(itens).toHaveLength(2);
    expect(itens.map((i) => i.nome)).toEqual(['Primeiro', 'Segundo']);
  });

  it('create() adiciona um item com id gerado e persiste em localStorage', async () => {
    const colecao = new MockCollection<Item>('itens-teste', SEED);
    const criado = await firstValueFrom(colecao.create({ nome: 'Terceiro' }));

    expect(criado.id).toBeTruthy();
    expect(criado.nome).toBe('Terceiro');
    expect(colecao.items()).toHaveLength(3);

    const persistido = JSON.parse(localStorage.getItem('escritorio-advocacia:itens-teste')!);
    expect(persistido).toHaveLength(3);
  });

  it('update() mescla as alterações sem afetar outros itens', async () => {
    const colecao = new MockCollection<Item>('itens-teste', SEED);
    const atualizado = await firstValueFrom(colecao.update('seed-1', { nome: 'Editado' }));

    expect(atualizado.nome).toBe('Editado');
    expect(colecao.items().find((i) => i.id === 'seed-2')?.nome).toBe('Segundo');
  });

  it('update() rejeita quando o id não existe', async () => {
    const colecao = new MockCollection<Item>('itens-teste', SEED);
    await expect(firstValueFrom(colecao.update('inexistente', { nome: 'X' }))).rejects.toThrow();
  });

  it('remove() tira o item da coleção', async () => {
    const colecao = new MockCollection<Item>('itens-teste', SEED);
    await firstValueFrom(colecao.remove('seed-1'));

    expect(colecao.items()).toHaveLength(1);
    expect(colecao.items()[0].id).toBe('seed-2');
  });

  it('uma nova instância com a mesma chave lê o estado persistido, não o seed', async () => {
    const primeira = new MockCollection<Item>('itens-teste', SEED);
    await firstValueFrom(primeira.create({ nome: 'Persistido' }));

    const segunda = new MockCollection<Item>('itens-teste', SEED);
    expect(segunda.items()).toHaveLength(3);
    expect(segunda.items().some((i) => i.nome === 'Persistido')).toBe(true);
  });

  it('reset() restaura a coleção ao seed original', async () => {
    const colecao = new MockCollection<Item>('itens-teste', SEED);
    await firstValueFrom(colecao.create({ nome: 'Temporário' }));
    expect(colecao.items()).toHaveLength(3);

    colecao.reset();
    expect(colecao.items()).toHaveLength(2);
    expect(colecao.items().map((i) => i.id)).toEqual(['seed-1', 'seed-2']);
  });
});
