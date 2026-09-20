const express = require('express');
const router = express.Router();
const {listarProfissionais} = require('../controllers/profissional.controller');

router.get('/', listarProfissionais);

module.exports = router;
