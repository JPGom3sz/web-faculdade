const express = require('express');
const router = express.Router();
const {listarEspecialidades} = require('../controllers/especialidade.controller');


router.get('/', listarEspecialidades);

module.exports = router;