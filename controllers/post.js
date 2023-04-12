const models = require('../models')
const auth = require('./auth')

const createPost = async (request, response) => {

    const creator = await auth.validUser(request)

    if (creator) {
        const content = request.body.content;
        const title = request.body.title;
        const postID = await models.createPost(title, content, creator.username);
 
        if (postID) {
            response.json({status: "success", id: postID})
        } else {
            response.json({status: "error"})
        }
    } else {
        response.sendStatus(401)
    }
}

const getPosts = async (request, response) => {

    let start = parseInt(request.query.start) || 1;
    let number = parseInt(request.query.count) || 10;

    if (start < 1) {
        start = 1;
    }
    if (number < 1) {
        number = 1;
    }
    if (number > 100) {
        number = 100;
    }
    const posts = await models.getPosts(start, number); 
    response.json({posts});
}

const getPost = async (request, response) => {

    const msgid = request.params.id
    const result = await models.getPost(msgid)
    if (result) {
        response.json(result)
    } else {
        response.sendStatus(401)
    }
}


module.exports = {
    createPost, 
    getPosts,
    getPost
}
