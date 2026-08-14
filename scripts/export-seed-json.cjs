// Script utilitário de migração (roda uma vez): lê os seeds TS que alimentavam o
// MockDbService e exporta o mesmo conjunto de dados como JSON, para o backend
// Python semear o Postgres com paridade exata em vez de retranscrever ~100 registros à mão.
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const SEED_DIR = path.join(__dirname, '..', 'src', 'app', 'core', 'mock-data', 'db');
const OUTPUT_PATH = path.join(__dirname, '..', 'backend', 'app', 'seed_data.json');

const ARQUIVOS = [
  { arquivo: 'usuarios.seed.ts', export: 'USUARIOS_SEED', chave: 'usuarios' },
  { arquivo: 'clientes.seed.ts', export: 'CLIENTES_SEED', chave: 'clientes' },
  { arquivo: 'processos.seed.ts', export: 'PROCESSOS_SEED', chave: 'processos' },
  { arquivo: 'prazos.seed.ts', export: 'PRAZOS_SEED', chave: 'prazos' },
  { arquivo: 'documentos.seed.ts', export: 'DOCUMENTOS_SEED', chave: 'documentos' },
  { arquivo: 'audiencias.seed.ts', export: 'AUDIENCIAS_SEED', chave: 'audiencias' },
  { arquivo: 'faturas.seed.ts', export: 'FATURAS_SEED', chave: 'faturas' },
];

function carregarSeed({ arquivo, export: nomeExport }) {
  const caminho = path.join(SEED_DIR, arquivo);
  const fonte = fs.readFileSync(caminho, 'utf8').replace(/^import .*$/gm, '');
  const { outputText } = ts.transpileModule(fonte, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });

  const sandboxModule = { exports: {} };
  const executar = new Function('module', 'exports', outputText);
  executar(sandboxModule, sandboxModule.exports);

  return sandboxModule.exports[nomeExport];
}

const resultado = {};
for (const entrada of ARQUIVOS) {
  resultado[entrada.chave] = carregarSeed(entrada);
  console.log(`${entrada.chave}: ${resultado[entrada.chave].length} registros`);
}

fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(resultado, null, 2));
console.log(`\nGerado: ${OUTPUT_PATH}`);
