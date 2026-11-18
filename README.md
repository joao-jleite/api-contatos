# API de Contatos

API REST em Node.js + Express + MySQL para criar, listar, atualizar e excluir contatos (nome e telefone).

## Requisitos

- Node.js 18 ou superior
- MySQL 8 (ou MariaDB 10.5+) rodando localmente

## Como rodar

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie o arquivo `.env` a partir do exemplo e preencha as credenciais do seu MySQL:

   ```bash
   cp .env.example .env
   ```

   | Variável      | Padrão        | Descrição                    |
   |---------------|---------------|------------------------------|
   | `PORT`        | `3000`        | Porta da API                 |
   | `DB_HOST`     | `localhost`   | Host do MySQL                |
   | `DB_PORT`     | `3306`        | Porta do MySQL               |
   | `DB_USER`     | `root`        | Usuário do MySQL             |
   | `DB_PASSWORD` | (vazio)       | Senha do usuário             |
   | `DB_NAME`     | `contatos_db` | Nome do banco                |

3. Suba a API:

   ```bash
   npm start
   ```

   Na inicialização, a API cria o banco `DB_NAME` e a tabela `contatos` se ainda não existirem. Se preferir criar manualmente, o script está em [`database/schema.sql`](database/schema.sql):

   ```bash
   mysql -u root -p < database/schema.sql
   ```

## Rotas

| Método   | Rota            | Descrição                  | Sucesso |
|----------|-----------------|----------------------------|---------|
| `POST`   | `/contatos`     | Cria um contato            | `201` com o contato criado |
| `GET`    | `/contatos`     | Lista todos os contatos    | `200` com a lista |
| `PATCH`  | `/contatos/:id` | Atualiza nome e/ou telefone| `200` com o contato atualizado |
| `DELETE` | `/contatos/:id` | Exclui um contato          | `204` |

Corpo de `POST` e `PATCH`:

```json
{ "nome": "Ana Souza", "telefone": "(11) 91234-5678" }
```

No `PATCH` os dois campos são opcionais, mas pelo menos um deve ser enviado.

### Exemplos

```bash
curl -X POST http://localhost:3000/contatos \
  -H "Content-Type: application/json" \
  -d '{"nome": "Ana Souza", "telefone": "(11) 91234-5678"}'

curl http://localhost:3000/contatos

curl -X PATCH http://localhost:3000/contatos/1 \
  -H "Content-Type: application/json" \
  -d '{"telefone": "11987654321"}'

curl -i -X DELETE http://localhost:3000/contatos/1
```

## Validações

**Nome**
- obrigatório, texto;
- no mínimo duas palavras, cada uma com pelo menos 3 letras (ex.: `Ana Souza`);
- apenas letras (acentos, hífen e apóstrofo são aceitos);
- espaços extras são removidos antes de salvar.

**Telefone**
- obrigatório, texto;
- aceita formatação com espaços, parênteses, hífen e `+55`;
- é salvo só com os dígitos: DDD + 8 dígitos (fixo) ou DDD + 9 dígitos (celular, começando com 9).

## Respostas de erro

| Status | Quando |
|--------|--------|
| `400`  | Dados inválidos, JSON malformado ou `id` que não é inteiro positivo |
| `404`  | Contato ou rota inexistente |
| `500`  | Erro inesperado |

Os erros de validação listam todos os campos com problema:

```json
{
  "erro": "Dados inválidos",
  "detalhes": [
    { "campo": "nome", "mensagem": "O nome deve ter no mínimo 2 palavras" }
  ]
}
```

## Decisões

- **DELETE com 204:** o status 204 (No Content) não permite corpo pela especificação HTTP, então a mensagem de sucesso vai no cabeçalho `X-Mensagem`.
- **Nome com preposição:** a regra "cada palavra com pelo menos 3 letras" foi aplicada como está no enunciado, então `João da Silva` é recusado por causa do `da`.
- **PATCH parcial:** só os campos enviados são validados e atualizados; campos desconhecidos são recusados.

## Testes

```bash
npm test
```

São testes unitários das validações e testes de integração de todas as rotas contra um MySQL real. O MySQL dos testes é baixado e iniciado automaticamente pelo [`mysql-memory-server`](https://www.npmjs.com/package/mysql-memory-server) na primeira execução, sem mexer no banco local.

## Estrutura

```
src/
  app.js                       configuração do Express e tratamento de erros
  server.js                    ponto de entrada
  config.js                    leitura do .env
  database.js                  conexão e criação da tabela
  errors.js                    erros HTTP
  contatos/
    contato.routes.js          rotas
    contato.validator.js       validações
    contato.repository.js      acesso ao MySQL
database/schema.sql            script do banco
test/                          testes
```
