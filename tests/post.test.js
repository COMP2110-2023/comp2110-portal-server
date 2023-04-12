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
    })

    beforeEach( async () => {
        await models.clearTables()
        await models.createUser(users[0]);
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
            .send({title: 'Authorised Post', content: 'Test Post Content'})
            .set('Authorization', `basic ${token}`)
            .expect(200)
            .expect(response => {
                expect(response.body.status).toBe('success');
            })
    });

    test('get posts', async () => {
        let token;
        await api.post('/users/login')
            .send({username: 'bobalooba', password: 'bob'})
            .expect(response => {
                token = response.body.token
            })

        console.log('token', token);

        for (let index = 0; index < 20; index++) {
            
            await api.post('/blog/')
                .send({title: 'Test Post ' + index, content: 'Test Post Content' + index})
                .set('Authorization', `basic ${token}`)
                .expect(200)
                .expect(response => {
                    expect(response.body.status).toBe('success');
                })
        }

        // get some posts
        await api.get('/blog')
            .expect(200)
            .expect(response => {
                expect(response.body.posts.length).toBe(10)
                expect(response.body.posts[0].title).toBe('Test Post 0')
            })

        // get 3 posts
        await api.get('/blog?count=3')
            .expect(200)
            .expect(response => {
                expect(response.body.posts.length).toBe(3)
                expect(response.body.posts[0].title).toBe('Test Post 0')
            })

        // get 3 posts starting at 3
        await api.get('/blog?count=3&start=3')
            .expect(200)
            .expect(response => {
                expect(response.body.posts.length).toBe(3)
                expect(response.body.posts[0].title).toBe('Test Post 2')
            })

        // non-integer values should be ignored
        await api.get('/blog?count=cat&start=blob')
            .expect(200)
            .expect(response => {
                expect(response.body.posts.length).toBe(10)
                expect(response.body.posts[0].title).toBe('Test Post 0')
            })
    });


    afterAll(() => {
        models.closeDB();
    })

})