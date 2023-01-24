const models = require('../models')
const auth = require('./auth')

const createPost = async (request, response) => {

    const creator = await auth.validUser(request)

    if (creator) {
        const content = request.body.content;
        const title = request.body.title;
        const post = new models.Post({creator, content, title});
        const returned = await post.save();

        if (returned) {
            response.json({status: "success", id: returned._id})
        } else {
            response.json({status: "error"})
        }
    } else {
        response.sendStatus(401)
    }
}

const getPosts = async (request, response) => {
 
        const posts = await models.Post.find()
                .populate('creator')
                .sort('timestamp')
        response.json({posts}) 
}

const getPost = async (request, response) => {

    const msgid = request.params.id
    const result = await models.Post.findById(msgid).populate('creator')
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