const app = require('express')();

app.use(require('./server'));

module.exports = app;