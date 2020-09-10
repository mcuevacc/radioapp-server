const fs = require('fs');
const { extname } = require('path');

const readSongs = (folderPath) => readDir(folderPath).filter(isMp3).map((songItem) => ({name: songItem.name, extension:extname(songItem.name)}));
const readDir = (folderPath) => fs.readdirSync(folderPath, { withFileTypes: true });
const isMp3 = (item) => item.isFile && extname(item.name) === '.mp3';

const shuffle = (a) => {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

//exports.readSong = () => _readDir().filter(_isMp3)[0].name;

//exports.discardFirstWord = str => str.substring(str.indexOf(' ') + 1);
//exports.getFirstWord = str => str.split(' ')[0];

//exports.generateRandomId = () => Math.random().toString(36).slice(2);

module.exports = {
    readSongs,
    shuffle
}
