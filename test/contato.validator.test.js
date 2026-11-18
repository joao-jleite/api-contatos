const {
  validarNome,
  validarTelefone,
  validarCriacao,
  validarAtualizacao,
  validarId,
} = require('../src/contatos/contato.validator');
const { ValidationError } = require('../src/errors');

describe('validarNome', () => {
  test.each(['Ana Souza', 'João Oliveira Santos', '  Maria   Clara  ', "Joana D'Arc", 'Ana-Lia Costa'])(
    'aceita "%s"',
    (nome) => {
      expect(validarNome(nome)).toBeNull();
    },
  );

  test.each([
    ['', 'vazio'],
    ['Ana', 'uma palavra'],
    ['Ana Li', 'palavra com menos de 3 letras'],
    ['João da Silva', 'preposição com 2 letras'],
    ['Ana S0uza', 'número no nome'],
    [123, 'não é texto'],
    [undefined, 'ausente'],
  ])('rejeita "%s" (%s)', (nome) => {
    expect(validarNome(nome)).not.toBeNull();
  });
});

describe('validarTelefone', () => {
  test.each(['(11) 91234-5678', '11912345678', '+55 11 91234-5678', '1132345678', '(21) 3234-5678'])(
    'aceita "%s"',
    (telefone) => {
      expect(validarTelefone(telefone)).toBeNull();
    },
  );

  test.each([
    ['', 'vazio'],
    ['12345', 'curto demais'],
    ['119123456789', 'longo demais'],
    ['(11) 81234-5678', 'celular sem 9'],
    ['(01) 91234-5678', 'DDD inválido'],
    ['11 9123a-5678', 'letra'],
    [11912345678, 'número em vez de texto'],
  ])('rejeita "%s" (%s)', (telefone) => {
    expect(validarTelefone(telefone)).not.toBeNull();
  });
});

describe('validarCriacao', () => {
  test('normaliza nome e telefone', () => {
    expect(validarCriacao({ nome: '  Ana   Souza ', telefone: '(11) 91234-5678' })).toEqual({
      nome: 'Ana Souza',
      telefone: '11912345678',
    });
  });

  test('exige os dois campos e devolve todos os erros', () => {
    expect.assertions(2);
    try {
      validarCriacao({});
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.details.map(({ campo }) => campo)).toEqual(['nome', 'telefone']);
    }
  });

  test.each([null, [], 'texto'])('rejeita corpo %p', (body) => {
    expect(() => validarCriacao(body)).toThrow(ValidationError);
  });
});

describe('validarAtualizacao', () => {
  test('aceita atualização parcial', () => {
    expect(validarAtualizacao({ telefone: '11912345678' })).toEqual({ telefone: '11912345678' });
  });

  test('rejeita corpo vazio', () => {
    expect(() => validarAtualizacao({})).toThrow(ValidationError);
  });

  test('rejeita campo desconhecido', () => {
    expect(() => validarAtualizacao({ nome: 'Ana Souza', id: 5 })).toThrow(ValidationError);
  });
});

describe('validarId', () => {
  test('converte id válido', () => {
    expect(validarId('42')).toBe(42);
  });

  test.each(['0', '-1', 'abc', '1.5', '99999999999'])('rejeita "%s"', (id) => {
    expect(() => validarId(id)).toThrow(ValidationError);
  });
});
