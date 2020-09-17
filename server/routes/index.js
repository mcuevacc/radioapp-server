const express = require('express');

const app = express();

app.use(require('./auth'));
//app.use(require('./load'));
app.use(require('./music'));
//app.use(require('./playlist'));
app.use(require('./play'));
app.use(require('./upload'));

module.exports = app;