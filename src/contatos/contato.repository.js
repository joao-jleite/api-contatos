const COLUNAS = 'id, nome, telefone, criado_em AS criadoEm, atualizado_em AS atualizadoEm';

function createContatoRepository(pool) {
  async function buscarPorId(id) {
    const [linhas] = await pool.query(`SELECT ${COLUNAS} FROM contatos WHERE id = ?`, [id]);
    return linhas[0] || null;
  }

  async function listar() {
    const [linhas] = await pool.query(`SELECT ${COLUNAS} FROM contatos ORDER BY id`);
    return linhas;
  }

  async function criar({ nome, telefone }) {
    const [resultado] = await pool.query('INSERT INTO contatos (nome, telefone) VALUES (?, ?)', [nome, telefone]);
    return buscarPorId(resultado.insertId);
  }

  async function atualizar(id, campos) {
    const [resultado] = await pool.query('UPDATE contatos SET ? WHERE id = ?', [campos, id]);
    if (resultado.affectedRows === 0) {
      return null;
    }
    return buscarPorId(id);
  }

  async function excluir(id) {
    const [resultado] = await pool.query('DELETE FROM contatos WHERE id = ?', [id]);
    return resultado.affectedRows > 0;
  }

  return { listar, criar, atualizar, excluir };
}

module.exports = { createContatoRepository };
