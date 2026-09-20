const express = require('express');
const path = require('path');
const app = express();

const especialidadeRoutes = require('./routes/especialidade.routes');
const profissionalRoutes = require('./routes/profissional.routes');
const disponibilidadeRoutes = require('./routes/disponibilidade.routes');
const agendamentoRoutes = require('./routes/agendamento.routes');

app.use(express.json());

app.use(express.static(path.join(__dirname, '..', '..', 'public')));

app.use('/api/especialidades', especialidadeRoutes);
app.use('/api/profissionais', profissionalRoutes);
app.use('/api/disponibilidade', disponibilidadeRoutes);
app.use('/api/agendamentos', agendamentoRoutes);

module.exports = app;