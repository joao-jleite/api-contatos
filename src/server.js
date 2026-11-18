const config = require('./config');
const { connectDatabase } = require('./database');
const { createApp } = require('./app');
const { createContatoRepository } = require('./contatos/contato.repository');

async function start() {
  const pool = await connectDatabase(config.database);
  const app = createApp({ contatoRepository: createContatoRepository(pool) });

  const server = app.listen(config.port, () => {
    console.log(`API de contatos rodando em http://localhost:${config.port}`);
  });

  const shutdown = async () => {
    server.close();
    await pool.end();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((error) => {
  console.error('Falha ao iniciar a API:', error.message);
  process.exit(1);
});
