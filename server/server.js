require('./config/config');

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Radio = require('./services/radio');

const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.resolve(__dirname, '../public')));
app.use(require('./routes'));

mongoose.connect(process.env.URLDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
},
(err, res) => {
    if (err) throw err;

    console.log('Base de datos ONLINE');
});

app.listen(process.env.PORT, async () => {
    console.log('Escuchando puerto: ', process.env.PORT);
    //var radio = new Radio();
    //radio.playMusic();
});