const mongoose = require('mongoose');
const DB_URI = 'mongodb://localhost/twitterclone';

function connect() {
    return new Promise((resolve, next) => {
        mongoose.connect(DB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useCreateIndex: true,
                useFindAndModify: false
            })
            .then((res, err) => {
                if (err) return next(err);
                resolve();
            })

    });
}

function close() {
    return mongoose.disconnect();
}

module.exports = { connect, close };