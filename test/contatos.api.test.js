const request = require('supertest');
const { createDB } = require('mysql-memory-server');
const { connectDatabase } = require('../src/database');
const { createApp } = require('../src/app');
const { createContatoRepository } = require('../src/contatos/contato.repository');

jest.setTimeout(600000);

let db;
let pool;
let app;

beforeAll(async () => {
  db = await createDB();
  pool = await connectDatabase({
    host: '127.0.0.1',
    port: db.port,
    user: db.username,
    password: '',
    name: 'contatos_test',
  });
  app = createApp({ contatoRepository: createContatoRepository(pool) });
});

afterAll(async () => {
  await pool?.end();
  await db?.stop();
});

beforeEach(async () => {
  await pool.query('TRUNCATE TABLE contatos');
});

async function criarContato(dados = { nome: 'Ana Souza', telefone: '(11) 91234-5678' }) {
  const resposta = await request(app).post('/contatos').send(dados);
  return resposta.body;
}

describe('POST /contatos', () => {
  test('cria contato e retorna 201', async () => {
    const resposta = await request(app)
      .post('/contatos')
      .send({ nome: 'Ana Souza', telefone: '(11) 91234-5678' });

    expect(resposta.status).toBe(201);
    expect(resposta.body).toMatchObject({ id: 1, nome: 'Ana Souza', telefone: '11912345678' });
  });

  test('retorna 400 com os erros de validação', async () => {
    const resposta = await request(app).post('/contatos').send({ nome: 'Ana', telefone: '123' });

    expect(resposta.status).toBe(400);
    expect(resposta.body.detalhes.map(({ campo }) => campo)).toEqual(['nome', 'telefone']);
  });

  test('retorna 400 para JSON malformado', async () => {
    const resposta = await request(app)
      .post('/contatos')
      .set('Content-Type', 'application/json')
      .send('{"nome": ');

    expect(resposta.status).toBe(400);
  });
});

describe('GET /contatos', () => {
  test('lista contatos com status 200', async () => {
    await criarContato();
    await criarContato({ nome: 'Bruno Lima', telefone: '21 3234-5678' });

    const resposta = await request(app).get('/contatos');

    expect(resposta.status).toBe(200);
    expect(resposta.body.map(({ nome }) => nome)).toEqual(['Ana Souza', 'Bruno Lima']);
  });

  test('retorna lista vazia quando não há contatos', async () => {
    const resposta = await request(app).get('/contatos');

    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual([]);
  });
});

describe('PATCH /contatos/:id', () => {
  test('atualiza contato e retorna 200', async () => {
    const { id } = await criarContato();

    const resposta = await request(app).patch(`/contatos/${id}`).send({ nome: 'Ana Souza Lima' });

    expect(resposta.status).toBe(200);
    expect(resposta.body).toMatchObject({ id, nome: 'Ana Souza Lima', telefone: '11912345678' });
  });

  test('retorna 404 para contato inexistente', async () => {
    const resposta = await request(app).patch('/contatos/999').send({ nome: 'Ana Souza' });

    expect(resposta.status).toBe(404);
  });

  test('retorna 400 para dados inválidos', async () => {
    const { id } = await criarContato();

    const resposta = await request(app).patch(`/contatos/${id}`).send({ telefone: 'abc' });

    expect(resposta.status).toBe(400);
  });

  test('retorna 400 para id inválido', async () => {
    const resposta = await request(app).patch('/contatos/abc').send({ nome: 'Ana Souza' });

    expect(resposta.status).toBe(400);
  });
});

describe('DELETE /contatos/:id', () => {
  test('exclui contato e retorna 204', async () => {
    const { id } = await criarContato();

    const resposta = await request(app).delete(`/contatos/${id}`);
    const lista = await request(app).get('/contatos');

    expect(resposta.status).toBe(204);
    expect(resposta.headers['x-mensagem']).toBe('Contato excluido com sucesso');
    expect(lista.body).toEqual([]);
  });

  test('retorna 404 para contato inexistente', async () => {
    const resposta = await request(app).delete('/contatos/999');

    expect(resposta.status).toBe(404);
  });
});
