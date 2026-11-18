const express = require('express');
const { HttpError } = require('./errors');
const { createContatoRoutes } = require('./contatos/contato.routes');

function notFoundHandler(_req, res) {
  res.status(404).json({ erro: 'Rota não encontrada' });
}

function errorHandler(error, _req, res, _next) {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido no corpo da requisição' });
  }

  if (error instanceof HttpError) {
    const corpo = { erro: error.message };
    if (error.details) {
      corpo.detalhes = error.details;
    }
    return res.status(error.statusCode).json(corpo);
  }

  console.error(error);
  return res.status(500).json({ erro: 'Erro interno do servidor' });
}

function createApp({ contatoRepository }) {
  const app = express();

  app.use(express.json());
  app.use('/contatos', createContatoRoutes(contatoRepository));
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
