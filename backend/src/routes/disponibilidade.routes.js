const express = require('express');
const router = express.Router();
const { listarDisponibilidade } = require('../controllers/disponibilidade.controller');

router.get('/', listarDisponibilidade);

module.exports = router;