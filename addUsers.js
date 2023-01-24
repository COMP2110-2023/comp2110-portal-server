const models = require('./models');
const bcrypt = require('bcrypt');
const { saltRounds } = require('./config.js');

const users = [
     {name: 'Bob Bobalooba', username: 'bobalooba', password: 'bob'},
     {name: 'Mary Contrary', username: 'contrary', password: 'mary'}
]

models.initDB();

users.forEach(userInfo => {
    bcrypt.hash(userInfo.password, saltRounds)
        .then(async result => {
            const newUserInfo = {...userInfo, password: result};
            console.log(newUserInfo);
            const user = new models.User(newUserInfo);
            await user.save();
        })
})
