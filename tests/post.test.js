const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const auth = require('../controllers/auth')
const models = require('../models')
 

const api = supertest(app)


const users = [
    {name: 'Bob Bobalooba', username: 'bobalooba', password: 'bob'},
    {name: 'Mary Contrary', username: 'contrary', password: 'mary'}
]

describe('auth', () => {

    beforeAll(async () => {
        await models.initDB()
        await models.createTables();
        await models.createUser(users[0]);
    })

    beforeEach( async () => {
        
    })

    test('create post not authorised', async () => {
        await api.post('/blog/')
            .send({title: 'Test Post', content: 'Test Post Content'})
            .expect(401)
    });

    test('create post authorised', async () => {
        let token;
        await api.post('/users/login')
            .send({username: 'bobalooba', password: 'bob'})
            .expect(response => {
                token = response.body.token
            })

        console.log('token', token);

        await api.post('/blog/')
            .send({title: 'Test Post', content: 'Test Post Content'})
            .set('Authorization', `basic ${token}`)
            .expect(200)
            .expect(response => {
                expect(response.body.status).toBe('success');
            })
    });


    afterAll(() => {
        models.closeDB();
    })

})