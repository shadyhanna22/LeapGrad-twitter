const expect = require('chai').expect;
const request = require('supertest');

const serv = require('../server');
const conn = require('../db/conn');

describe('POST /tweets', () => {


    before((done) => {
        conn.connect()
            .then(() => done())
            .catch((err) => done(err));
    })

    // cleans up the test users and closes DB conncetion
    var testUserId;
    var testUserAuthToken;
    var testTweetId;
    after((done) => {
        request(serv).del(`/user/${testUserId}`)
            .then(() => {
                conn.close()
                    .then(() => done())
                    .catch((err) => done(err));
            })
    })



    it('Pass, creating a new test user', (done) => {
        request(serv).post('/user/signup')
            .send({
                "email": "testUser@test.com",
                "password": "test"
            })
            .then((res) => {
                const body = res.body;

                expect(body).to.contain.property('_id');
                expect(body).to.contain.property('email');
                expect(body).to.contain.property('password');
                done();
            })
            .catch((err) => done(err))
    })

    it('Pass, login to get a token', (done) => {
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

    it('Pass, creating a new tweet', (done) => {
        request(serv).post('/tweets')
            .set('Authorization', 'Bearer ' + `${testUserAuthToken}`)
            .send({
                "auther": `${testUserId}`,
                "text": "This is a test Tweet"
            })
            .then((res) => {
                const body = res.body;
                testTweetId = body.createdTweet._id;

                expect(body).to.contain.property('message');
                expect(body).to.contain.property('createdTweet');
                done();
            })
            .catch((err) => done(err))
    })

    it('Pass, edit a tweet', (done) => {
        request(serv).patch(`/tweets/${testTweetId}`)
            .set('Authorization', 'Bearer ' + `${testUserAuthToken}`)
            .send({
                "text": "I can edit my tweet"
            })
            .then((res) => {
                const body = res.body;

                expect(body).to.contain.property('message');
                done();
            })
            .catch((err) => done(err))
    })

    it('Pass, delete a tweet', (done) => {
        request(serv).del(`/tweets/${testTweetId}`)
            .set('Authorization', 'Bearer ' + `${testUserAuthToken}`)
            .then((res) => {
                const body = res.body;

                expect(body).to.contain.property('message');
                done();
            })
            .catch((err) => done(err))
    })

})