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


    test('get tasks', async () => {
        let token;
        await api.post('/users/login')
            .send({username: 'bobalooba', password: 'bob'})
            .expect(response => {
                token = response.body.token
            })

        for (let index = 0; index < 20; index++) {
            
            await api.post('/tasks')
                .send({text: 'Test Task ' + index})
                .set('Authorization', `basic ${token}`)
                .expect(200)
                .expect(response => {
                    expect(response.body.status).toBe('success');
                })
        }

        // get some tasks
        await api.get('/tasks')
            .expect(200)
            .set('Authorization', `basic ${token}`)
            .expect(response => {
                expect(response.body.tasks.length).toBe(10)
                expect(response.body.tasks[0].text).toBe('Test Task 19')
            })

        // get 3 tasks
        await api.get('/tasks?count=3')
            .expect(200)
            .set('Authorization', `basic ${token}`)
            .expect(response => {
                expect(response.body.tasks.length).toBe(3)
                expect(response.body.tasks[0].text).toBe('Test Task 19')
            })

        // get 3 tasks starting at 3
        await api.get('/tasks?count=3&start=3')
            .expect(200)
            .set('Authorization', `basic ${token}`)
            .expect(response => {
                expect(response.body.tasks.length).toBe(3)
                expect(response.body.tasks[0].text).toBe('Test Task 17')
            })

        // non-integer values should be ignored
        await api.get('/tasks?count=cat&start=blob')
            .expect(200)
            .set('Authorization', `basic ${token}`)
            .expect(response => {
                expect(response.body.tasks.length).toBe(10)
                expect(response.body.tasks[0].text).toBe('Test Task 19')
            })
    });

    afterAll(() => {
        models.closeDB();
    })

})