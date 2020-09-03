const express = require('express');

const app = express();

app.use(require('./auth'));
app.use(require('./playlist'));
app.use(require('./load'));

module.exports = app;