const models = require('./models');


const users = [
    {name: 'Bob Bobalooba', username: 'bobalooba', password: 'bob'},
    {name: 'Mary Contrary', username: 'contrary', password: 'mary'}
]
models.initDB()
.then(() => {
    models.createTables();
})
.then(() => {
    models.createUser(users[0]);
    models.createUser(users[1]);
})