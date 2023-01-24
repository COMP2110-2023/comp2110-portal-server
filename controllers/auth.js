const { randomUUID } = require('crypto');
const bcrypt = require('bcrypt');
const models = require('../models')


/* handle login submission */
const loginUser = async (request, response) => {
 
    console.log(request.body);
    const username = request.body.username; 
    const user = await models.User.findOne({username: username});
    if (user) {
        const check = await bcrypt.compare(request.body.password, user.password);
        if (check) {
            // check for existing session
            let session = await models.Session.findOne({username: username});
            if (!session) {
                session = new models.Session({username: username, key: randomUUID()});
                await session.save();
            }
            response.json({
                token: session.key,
                name: user.name,
                username: username
            })
            return;
        }
    }
    response.json({
        error: "login incorrect"
    })    
}


const getUser = async (request, response) => {

    const authHeader = request.get('Authorization')
    if (authHeader && authHeader.toLowerCase().startsWith('basic ')) {
        const token = authHeader.substring(6)
        try {
            // this will throw an error if token isn't of the right format
            const match = await models.Session.findById(token)  
            if (match) {
                response.json({
                    status: "success",
                    username: match.username,
                    token: match._id
                })       
            }
        } catch { }

    }
    response.json({status: "unregistered"}) 
}

/* 
 * validUser - check for a valid user via Authorization header
 *   return the user object if found, false if not
*/
const validUser = async (request) => {
    
    const authHeader = request.get('Authorization')
    if (authHeader && authHeader.toLowerCase().startsWith('basic ')) {
        const token = authHeader.substring(6)        
        const match = await models.Session.findOne({key: token})  

        if (match) {
            const user = await models.User.findOne({username: match.username})
            return user
        }
    } 
    return false
}

module.exports = { validUser, getUser, loginUser }
