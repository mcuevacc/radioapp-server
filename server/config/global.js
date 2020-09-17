const path = require('path');

const codRadio = 'RADIO';
const codRecord = 'RECORD';

const minRadioPlayList = 2;

const perPage = 5;
const tmpPath = path.resolve(__dirname, '../../uploads/tmp');
const musicAudioPath = path.resolve(__dirname, '../../uploads/audio/music');
const musicImagePath = path.resolve(__dirname, '../../uploads/image/music');
const musicExtensions = ['mp3'];
const musicSize = 20*1024*1024;
const tmpHashLength = 8;

const saltHashPwd = 10;

module.exports = {
    codRadio,
    codRecord,
    minRadioPlayList,
    musicAudioPath,
    musicExtensions,
    musicImagePath,
    musicSize,
    perPage,
    saltHashPwd,
    tmpHashLength,
    tmpPath
}