const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();

const tweetsRoutes = require('./api/routes/tweet');
const userRoutes = require('./api/routes/user');
const chatRoutes = require('./api/routes/chat');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// set up for browser user
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        req.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

// routes
app.use('/tweets', tweetsRoutes);
app.use('/user', userRoutes);
app.use('/chat', chatRoutes);

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
});

module.exports = app;