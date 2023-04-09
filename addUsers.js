const models = require('./models');
const fs = require('fs');

let users = []; 

try {
    const csv = fs.readFileSync('accounts.csv', 'utf-8');
    const lines = csv.split('\n');
    for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        const [name, username, password] = line.split(',');
        if (username) {
            users.push({name, username, password})
        }
    }
} catch (e) {
    console.log(e);
    users = [
        {name: 'Bob Bobalooba', username: 'bobalooba', password: 'bob'},
        {name: 'Mary Contrary', username: 'contrary', password: 'mary'}
    ]
}

models.initDB()
.then(() => {
    models.createTables();
})
.then(() => {
    users.map(user => models.createUser(user));
})
