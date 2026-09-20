const pool = require('../config/db');

const buscarOuCriarPaciente = async ({nome, cpf, data_nascimento, telefone }) =>{
    const existente = await pool.query (
        'SELECT * FROM paciente WHERE cpf = $1',
        [cpf]
    );

   if (existente.rows.length > 0) {
    return existente.rows[0];
}

    const novo = await pool.query(
        'INSERT INTO paciente (nome, cpf, data_nascimento, telefone) VALUES ($1, $2, $3, $4) RETURNING *',
        [nome, cpf, data_nascimento, telefone]

    );

    return novo.rows[0];


};

module.exports = { buscarOuCriarPaciente };