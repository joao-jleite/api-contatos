const { Router } = require('express');
const { NotFoundError } = require('../errors');
const { validarCriacao, validarAtualizacao, validarId } = require('./contato.validator');

const CONTATO_NAO_ENCONTRADO = 'Contato não encontrado';

function createContatoRoutes(repository) {
  const router = Router();

  router.post('/', async (req, res) => {
    const dados = validarCriacao(req.body);
    const contato = await repository.criar(dados);
    res.status(201).json(contato);
  });

  router.get('/', async (_req, res) => {
    const contatos = await repository.listar();
    res.status(200).json(contatos);
  });

  router.patch('/:id', async (req, res) => {
    const id = validarId(req.params.id);
    const dados = validarAtualizacao(req.body);
    const contato = await repository.atualizar(id, dados);
    if (!contato) {
      throw new NotFoundError(CONTATO_NAO_ENCONTRADO);
    }
    res.status(200).json(contato);
  });

  router.delete('/:id', async (req, res) => {
    const id = validarId(req.params.id);
    const excluido = await repository.excluir(id);
    if (!excluido) {
      throw new NotFoundError(CONTATO_NAO_ENCONTRADO);
    }
    res.set('X-Mensagem', 'Contato excluido com sucesso').status(204).end();
  });

  return router;
}

module.exports = { createContatoRoutes };
