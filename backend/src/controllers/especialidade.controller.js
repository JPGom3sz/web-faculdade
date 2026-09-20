const pool = require('../config/db');

const listarEspecialidades = async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM especialidade ORDER BY nome');
        res.json(resultado.rows);
    } catch (erro) {
        console.error('Erro ao buscar especialidade', erro);
        res.status(500).json({ erro: 'Erro ao buscar especialidade' });
    }
};

module.exports = { listarEspecialidades };