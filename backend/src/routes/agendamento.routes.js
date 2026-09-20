const express = require('express');
const router = express.Router();
const { criarAgendamento, listarAgendamentosPorCpf, cancelarAgendamento } = require('../controllers/agendamento.controller');

router.post('/', criarAgendamento);
router.get('/', listarAgendamentosPorCpf);
router.delete('/:id', cancelarAgendamento);

module.exports = router;