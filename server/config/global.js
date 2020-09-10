const path = require('path');

const codRadio = 'RADIO';
const codRecord = 'RECORD';

const minRadioPlayList = 2;

const perPage = 5;
const uploadPath = path.resolve(__dirname, '../../uploads');

module.exports = {
    codRadio,
    codRecord,
    minRadioPlayList,
    perPage,
    uploadPath
}