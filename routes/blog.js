const express = require('express');
const post = require('../controllers/post.js');

const router = express.Router();

/* GET recent blog posts. */
router.get('/', post.getPosts );
router.get('/:id', post.getPost);
router.post('/', post.createPost);

module.exports = router;
