const expect = require('chai').expect;
const request = require('supertest');

const serv = require('../server');
const conn = require('../db/conn');

describe('POST /chat', () => {


    before((done) => {
        conn.connect()
            .then(() => done())
            .catch((err) => done(err));
    })

    // cleans up the test users and closes DB conncetion
    var testUserId1;
    var testUserId2;
    var testUserAuthToken1;
    var testUserAuthToken2;
    var testChatId;
    after((done) => {
        request(serv).del(`/user/${testUserId1}`)
            .then(() => {
                request(serv).del(`/user/${testUserId2}`)
                    .then(() => {
                        conn.close()
                            .then(() => done())
                            .catch((err) => done(err));
                    })
            })
    })



    it('Pass, creating a new test1 user', (done) => {
        request(serv).post('/user/signup')
            .send({
                "email": "testUser1@test.com",
                "password": "test"
            })
            .then((res) => {
                const body = res.body;
                testUserId1 = body._id;

                expect(body).to.contain.property('_id');
                expect(body).to.contain.property('email');
                expect(body).to.contain.property('password');
                done();
            })
            .catch((err) => done(err))
    })

    it('Pass, creating a new test2 user', (done) => {
        request(serv).post('/user/signup')
            .send({
                "email": "testUser2@test.com",
                "password": "test"
            })
            .then((res) => {
                const body = res.body;
                testUserId2 = body._id;

                expect(body).to.contain.property('_id');
                expect(body).to.contain.property('email');
                expect(body).to.contain.property('password');
                done();
            })
            .catch((err) => done(err))
    })

    it('Pass, login to get a token1', (done) => {
        request(serv).post('/user/login')
            .send({
                "email": "testUser1@test.com",
                "password": "test"
            })
            .then((res) => {
                const body = res.body;
                testUserAuthToken1 = body.token;

                expect(body).to.contain.property('message');
                expect(body).to.contain.property('userId');
                expect(body).to.contain.property('token');
                done();
            })
            .catch((err) => done(err))
    })

    it('Pass, login to get a token2', (done) => {
        request(serv).post('/user/login')
            .send({
                "email": "testUser2@test.com",
                "password": "test"
            })
            .then((res) => {
                const body = res.body;
                testUserAuthToken2 = body.token;

                expect(body).to.contain.property('message');
                expect(body).to.contain.property('userId');
                expect(body).to.contain.property('token');
                done();
            })
            .catch((err) => done(err))
    })

    it('Pass, creating a new chat', (done) => {
        request(serv).post(`/chat/new/${testUserId2}`)
            .set('Authorization', 'Bearer ' + `${testUserAuthToken1}`)
            .then((res) => {
                const body = res.body;
                testChatId = body._id;

                expect(body).to.contain.property('message');
                expect(body).to.contain.property('_id');
                done();
            })
            .catch((err) => done(err))
    })

    it('Pass, sent a message from user1 to user2', (done) => {
        request(serv).post(`/chat/send/${testUserId2}`)
            .set('Authorization', 'Bearer ' + `${testUserAuthToken1}`)
            .send({
                "text": "hey, how are you?"
            })
            .then((res) => {
                const body = res.body;

                expect(body).to.contain.property('message');
                expect(body).to.contain.property('author');
                expect(body).to.contain.property('text');
                done();
            })
            .catch((err) => done(err))
    })

    it('Pass, sent a message from user2 to user1', (done) => {
        request(serv).post(`/chat/send/${testUserId1}`)
            .set('Authorization', 'Bearer ' + `${testUserAuthToken2}`)
            .send({
                "text": "I am good, how are you?"
            })
            .then((res) => {
                const body = res.body;

                expect(body).to.contain.property('message');
                expect(body).to.contain.property('author');
                expect(body).to.contain.property('text');
                done();
            })
            .catch((err) => done(err))
    })

    it('Pass, messages in the chat', (done) => {
        request(serv).get(`/chat/${testChatId}`)
            .set('Authorization', 'Bearer ' + `${testUserAuthToken1}`)
            .then((res) => {
                const body = res.body;

                expect(body).to.contain.property('messages');
                done();
            })
            .catch((err) => done(err))
    })

})