const mysql = require('mysql2/promise');

const CREATE_CONTATOS_TABLE = `
  CREATE TABLE IF NOT EXISTS contatos (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nome VARCHAR(120) NOT NULL,
    telefone VARCHAR(11) NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
  )
`;

async function ensureDatabase({ host, port, user, password, name }) {
  const connection = await mysql.createConnection({ host, port, user, password });
  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${mysql.escapeId(name)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
  } finally {
    await connection.end();
  }
}

async function connectDatabase(databaseConfig) {
  await ensureDatabase(databaseConfig);

  const pool = mysql.createPool({
    host: databaseConfig.host,
    port: databaseConfig.port,
    user: databaseConfig.user,
    password: databaseConfig.password,
    database: databaseConfig.name,
    waitForConnections: true,
    connectionLimit: 10,
  });

  await pool.query(CREATE_CONTATOS_TABLE);
  return pool;
}

module.exports = { connectDatabase };
