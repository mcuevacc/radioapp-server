const app = require('express')();

app.use(require('./auth'));
app.use(require('./image'));
app.use(require('./load'));
app.use(require('./music'));
app.use(require('./musiclist'));
app.use(require('./play'));
app.use(require('./playlist'));
app.use(require('./radio'));
app.use(require('./upload'));

module.exports = app;