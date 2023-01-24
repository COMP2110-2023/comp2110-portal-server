const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const auth = require('../controllers/auth')
const models = require('../models')


const api = supertest(app)

describe('auth', () => {

    beforeEach(async () => {
        await models.Session.deleteMany({username: 'bobalooba'})
    })

    test('post to login', async () => {
        await api.post('/users/login')
            .send({username: 'bobalooba', password: 'bob'})
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .expect((response) => {
                expect(response.body.status).toBe('success')
                expect(response.body.username).toBe('bobalooba')
                expect(response.body.token).not.toBeNull()
            }) 
    })
    afterAll(() => {
        mongoose.connection.close()
    })

})