const { ValidationError } = require('../errors');

const MIN_PALAVRAS_NOME = 2;
const MIN_LETRAS_POR_PALAVRA = 3;
const MAX_CARACTERES_NOME = 120;
const SOMENTE_LETRAS = /^[\p{L}'-]+$/u;
const DIGITOS_TELEFONE_VALIDOS = [10, 11];
const CARACTERES_TELEFONE = /^[\d\s()+-]+$/;

function contarLetras(palavra) {
  return (palavra.match(/\p{L}/gu) || []).length;
}

function normalizarNome(nome) {
  return nome.trim().replace(/\s+/g, ' ');
}

function validarNome(nome) {
  if (typeof nome !== 'string' || nome.trim() === '') {
    return 'O nome é obrigatório e deve ser um texto';
  }

  const nomeNormalizado = normalizarNome(nome);
  if (nomeNormalizado.length > MAX_CARACTERES_NOME) {
    return `O nome deve ter no máximo ${MAX_CARACTERES_NOME} caracteres`;
  }

  const palavras = nomeNormalizado.split(' ');
  if (palavras.length < MIN_PALAVRAS_NOME) {
    return `O nome deve ter no mínimo ${MIN_PALAVRAS_NOME} palavras`;
  }

  const palavraInvalida = palavras.find(
    (palavra) => !SOMENTE_LETRAS.test(palavra) || contarLetras(palavra) < MIN_LETRAS_POR_PALAVRA,
  );
  if (palavraInvalida) {
    return `Cada palavra do nome deve ter pelo menos ${MIN_LETRAS_POR_PALAVRA} letras e conter apenas letras`;
  }

  return null;
}

function normalizarTelefone(telefone) {
  return telefone.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '');
}

function validarTelefone(telefone) {
  if (typeof telefone !== 'string' || telefone.trim() === '') {
    return 'O telefone é obrigatório e deve ser um texto';
  }

  if (!CARACTERES_TELEFONE.test(telefone)) {
    return 'O telefone deve conter apenas números, espaços, parênteses, hífen ou +';
  }

  const digitos = normalizarTelefone(telefone);
  if (!DIGITOS_TELEFONE_VALIDOS.includes(digitos.length)) {
    return 'O telefone deve ter DDD e 8 ou 9 dígitos, por exemplo (11) 91234-5678';
  }

  if (digitos.startsWith('0') || digitos[2] === '0') {
    return 'O telefone informado não é válido';
  }

  if (digitos.length === 11 && digitos[2] !== '9') {
    return 'Celular com 11 dígitos deve começar com 9 após o DDD';
  }

  return null;
}

const VALIDADORES = {
  nome: validarNome,
  telefone: validarTelefone,
};

const NORMALIZADORES = {
  nome: normalizarNome,
  telefone: normalizarTelefone,
};

function assertObjeto(body) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new ValidationError([{ campo: 'body', mensagem: 'O corpo da requisição deve ser um objeto JSON' }]);
  }
}

function validarCampos(body, campos) {
  const erros = campos
    .map((campo) => ({ campo, mensagem: VALIDADORES[campo](body[campo]) }))
    .filter(({ mensagem }) => mensagem !== null);

  if (erros.length > 0) {
    throw new ValidationError(erros);
  }

  return Object.fromEntries(campos.map((campo) => [campo, NORMALIZADORES[campo](body[campo])]));
}

function validarCriacao(body) {
  assertObjeto(body);
  return validarCampos(body, ['nome', 'telefone']);
}

function validarAtualizacao(body) {
  assertObjeto(body);

  const camposDesconhecidos = Object.keys(body).filter((campo) => !(campo in VALIDADORES));
  if (camposDesconhecidos.length > 0) {
    throw new ValidationError(
      camposDesconhecidos.map((campo) => ({ campo, mensagem: 'Campo não permitido' })),
    );
  }

  const camposEnviados = Object.keys(VALIDADORES).filter((campo) => body[campo] !== undefined);
  if (camposEnviados.length === 0) {
    throw new ValidationError([{ campo: 'body', mensagem: 'Informe nome e/ou telefone para atualizar' }]);
  }

  return validarCampos(body, camposEnviados);
}

function validarId(id) {
  if (!/^[1-9]\d{0,9}$/.test(String(id)) || Number(id) > 4294967295) {
    throw new ValidationError([{ campo: 'id', mensagem: 'O id deve ser um número inteiro positivo' }]);
  }
  return Number(id);
}

module.exports = {
  validarCriacao,
  validarAtualizacao,
  validarId,
  validarNome,
  validarTelefone,
};
