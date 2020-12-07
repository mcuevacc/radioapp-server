require('./config/config');

const express = require('express');;
const bodyParser = require('body-parser');
const path = require('path');

const db = require('./config/db');
db(process.env.DB_URL);

const Radio = require('./services/radio');
module.exports.radio = new Radio();

const app = express();

app.use(bodyParser.json());
app.use(express.static(path.resolve(__dirname, '../public')));
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
app.use(require('./routes'));

app.listen(process.env.PORT, async() => {
    console.log('Escuchando puerto: ', process.env.PORT);
    let res = await this.radio.setNextMusic();
    console.log('setNextMusic', res);
});