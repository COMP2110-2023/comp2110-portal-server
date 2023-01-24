const express = require('express');
const auth = require('../controllers/auth.js');

const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/login', auth.loginUser)

module.exports = router;
