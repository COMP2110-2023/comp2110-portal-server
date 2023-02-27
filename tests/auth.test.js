const supertest = require('supertest')
const app = require('../app')
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

    test('post to login', async () => {
        await api.post('/users/login')
            .send({username: 'bobalooba', password: 'bob'})
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .expect((response) => {
                expect(response.body.name).toBe('Bob Bobalooba')
                expect(response.body.username).toBe('bobalooba')
                expect(response.body.token).not.toBeNull()
            }) 
    });

    afterAll(() => {
    })

})