const pool = require('../config/db');
const { buscarOuCriarPaciente } = require('./paciente.controller');

const criarAgendamento = async (req, res) => {
    try {
        const { nome, cpf, data_nascimento, telefone, profissional_id, data, hora } = req.body;

        if (!nome || !cpf || !data_nascimento || !telefone || !profissional_id || !data || !hora) {
            return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
        }

        const paciente = await buscarOuCriarPaciente({ nome, cpf, data_nascimento, telefone });

        const resultado = await pool.query(
    `INSERT INTO agendamento (paciente_id, profissional_id, data, hora, status)
     VALUES ($1, $2, $3, $4, 'agendado')
     RETURNING id, paciente_id, profissional_id, TO_CHAR(data, 'YYYY-MM-DD') AS data, hora, status`,
    [paciente.id, profissional_id, data, hora]
);

        res.status(201).json(resultado.rows[0]);
    } catch (erro) {
        console.error('Erro ao criar agendamento', erro);
        res.status(500).json({ erro: 'Erro ao criar agendamento' });
    }
};

const listarAgendamentosPorCpf = async (req, res) => {
    try {
        const { cpf } = req.query;

        if (!cpf) {
            return res.status(400).json({ erro: 'CPF é obrigatório' });
        }

       const resultado = await pool.query(
    `SELECT agendamento.id, agendamento.paciente_id, agendamento.profissional_id,
            TO_CHAR(agendamento.data, 'YYYY-MM-DD') AS data, agendamento.hora, agendamento.status,
            paciente.nome, paciente.cpf
     FROM agendamento
     JOIN paciente ON paciente.id = agendamento.paciente_id
     WHERE paciente.cpf = $1
     ORDER BY agendamento.data, agendamento.hora`,
    [cpf]
);

        res.json(resultado.rows);
    } catch (erro) {
        console.error('Erro ao buscar agendamentos', erro);
        res.status(500).json({ erro: 'Erro ao buscar agendamentos' });
    }
};

const cancelarAgendamento = async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await pool.query(
    `UPDATE agendamento SET status = 'cancelado' WHERE id = $1
     RETURNING id, paciente_id, profissional_id, TO_CHAR(data, 'YYYY-MM-DD') AS data, hora, status`,
    [id]
);

        if (resultado.rows.length === 0) {
            return res.status(404).json({ erro: 'Agendamento não encontrado' });
        }

        res.json(resultado.rows[0]);
    } catch (erro) {
        console.error('Erro ao cancelar agendamento', erro);
        res.status(500).json({ erro: 'Erro ao cancelar agendamento' });
    }
};

module.exports = { criarAgendamento, listarAgendamentosPorCpf, cancelarAgendamento };