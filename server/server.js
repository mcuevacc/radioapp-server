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
    var radio = new Radio();
    //radio.playMusic();
});



/*


var nodeshout = require('nodeshout'),
	FileReadStream = require('nodeshout').FileReadStream,
    ShoutStream = require('nodeshout').ShoutStream,
   

nodeshout.init();

console.log('Libshout version: ' + nodeshout.getVersion());

// Create instance and configure it.
var shout = nodeshout.create();
shout.setHost('localhost');
shout.setPort(8000);
shout.setUser('source');
shout.setPassword('123456');
shout.setMount('stream');
shout.setFormat(1); // 0=ogg, 1=mp3
shout.setAudioInfo('bitrate', '192');
shout.setAudioInfo('samplerate', '44100');
shout.setAudioInfo('channels', '2');

shout.open();

// Create file read stream and shout stream
var fileStream = new FileReadStream('./music.mp3', 65536),
    shoutStream = fileStream.pipe(new ShoutStream(shout));

fileStream.on('data', function(chunk) {
    console.log('Read %d bytes of data', chunk.length);
});

shoutStream.on('finish', function() {
    console.log('Finished playing...');
});
*/  