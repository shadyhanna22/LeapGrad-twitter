const expect = require('chai').expect;
const request = require('supertest');

const serv = require('../server');
const conn = require('../db/conn');

describe('POST /user', () => {


    before((done) => {
        conn.connect()
            .then(() => done())
            .catch((err) => done(err));
    })

    // cleans up the test users and closes DB conncetion
    var testUserId;
    after((done) => {
        request(serv).del(`/user/${testUserId}`)
            .then(() => {
                conn.close()
                    .then(() => done())
                    .catch((err) => done(err));
            })
    })



    it('Pass, creating a new user', (done) => {
        request(serv).post('/user/signup')
            .send({
                "email": "testUser@test.com",
                "password": "test"
            })
            .then((res) => {
                const body = res.body;
                testUserId = res.body._id;

                expect(body).to.contain.property('_id');
                expect(body).to.contain.property('email');
                expect(body).to.contain.property('password');
                done();
            })
            .catch((err) => done(err))
    })

    it('Pass, cannot create the same user again', (done) => {
        request(serv).post('/user/signup')
            .send({
                "email": "testUser@test.com",
                "password": "test"
            })
            .then((res) => {
                const body = res.body;

                expect(body).to.not.contain.property('_id');
                expect(body).to.not.contain.property('email');
                expect(body).to.not.contain.property('password');
                expect(body).to.contain.property('message');
                done();
            })
            .catch((err) => done(err))
    })

    it('Pass, login and get a token', (done) => {
        request(serv).post('/user/login')
            .send({
                "email": "testUser@test.com",
                "password": "test"
            })
            .then((res) => {
                const body = res.body;
                testUserId = res.body.userId;
                testUserAuthToken = res.body.token;

                expect(body).to.contain.property('message');
                expect(body).to.contain.property('userId');
                expect(body).to.contain.property('token');
                done();
            })
            .catch((err) => done(err))
    })
})