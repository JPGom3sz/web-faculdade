const pool = require('../config/db');

const listarProfissionais = async (req, res) => {
    try {
        const { especialidade_id } = req.query;

        let query = 'SELECT * FROM profissional';
        let params = [];

        if (especialidade_id) {
            query += ' WHERE especialidade_id = $1';
            params.push(especialidade_id);
        }

        query += ' ORDER BY nome';

        const resultado = await pool.query(query, params);
        res.json(resultado.rows);
    } catch (erro) {
        console.error('Erro ao buscar profissionais', erro);
        res.status(500).json({ erro: 'Erro ao buscar profissionais' });
    }
};

module.exports = { listarProfissionais };