const http = require('http');
const app = require('./app');
const db = require('./db/conn');

const port = process.env.PORT || 3000;

const server = http.createServer(app);

db.connect()
    .then(() => {
        server.listen(port);
    })

module.exports = server