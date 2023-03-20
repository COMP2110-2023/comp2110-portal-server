const supertest = require('supertest')
const app = require('../app')
const models = require('../models')
 

const api = supertest(app)


const users = [
    {name: 'Bob Bobalooba', username: 'bobalooba', password: 'bob'},
    {name: 'Mary Contrary', username: 'contrary', password: 'mary'}
]

describe('tasks', () => {

    beforeAll(async () => {
        await models.initDB()
        await models.createTables();
    })

    beforeEach( async () => {
        await models.clearTables();
        await models.createUser(users[0]);
    })

    test('create task not authorised', async () => {
        await api.post('/tasks/')
            .send({text: 'Test Task'})
            .expect(401)
    });

    test('create task authorised', async () => {
        let token;
        await api.post('/users/login')
            .send({username: 'bobalooba', password: 'bob'})
            .expect(response => {
                token = response.body.token
            })

        console.log('token', token);

        await api.post('/tasks/')
            .send({text: 'Test Task'})
            .set('Authorization', `basic ${token}`)
            .expect(200)
            .expect(response => {
                expect(response.body.status).toBe('success');
            })
    });

    test('update task', async () => {
        let token;
        let createdId;
        await api.post('/users/login')
            .send({username: 'bobalooba', password: 'bob'})
            .expect(response => {
                token = response.body.token
            })

        console.log('update token', token);

        await api.post('/tasks/')
            .send({text: 'Test Task'})
            .set('Authorization', `basic ${token}`)
            .expect(200)
            .expect(response => {
                console.log('response', response.body);
                expect(response.body.status).toBe('success');
                createdId = response.body.id;
            });
        console.log('update created', createdId);
        api.post('/tasks/' + createdId)
                .send({status: 'complete'})
                .expect(200)
                .expect(response => {
                    console.log('response to update', response.body);
                    expect(response.body.status).toBe('success');
                })
    });


    afterAll(() => {
        models.closeDB();
    })

})