const pool = require('../config/db');

const listarDisponibilidade = async (req, res) => {
    try {
        const { profissional_id } = req.query;

        let query = "SELECT id, profissional_id, TO_CHAR(data, 'YYYY-MM-DD') AS data, hora_inicio, hora_fim, disponivel FROM disponibilidade WHERE disponivel = true";
        let params = [];

        if (profissional_id) {
            query += ' AND profissional_id = $1';
            params.push(profissional_id);
        }

        query += ' ORDER BY data, hora_inicio';

        const resultado = await pool.query(query, params);

        const agrupado = {};

        resultado.rows.forEach(linha => {
            const dataStr = linha.data;

            if (!agrupado[dataStr]) {
                const [ano, mes, dia] = dataStr.split('-');
                agrupado[dataStr] = {
                    data: dataStr,
                    label: `${dia}/${mes}`,
                    horarios: []
                };
            }

            const horaFormatada = linha.hora_inicio.slice(0, 5);
            agrupado[dataStr].horarios.push(horaFormatada);
        });

        const listaFinal = Object.values(agrupado);

        res.json(listaFinal);
    } catch (erro) {
        console.error('Erro ao buscar disponibilidade', erro);
        res.status(500).json({ erro: 'Erro ao buscar disponibilidade' });
    }
};

module.exports = { listarDisponibilidade };