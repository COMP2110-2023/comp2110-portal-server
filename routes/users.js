const express = require('express');
const auth = require('../controllers/auth.js');

const router = express.Router();

router.post('/login', auth.loginUser)

module.exports = router;
