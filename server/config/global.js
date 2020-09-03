const path = require('path');

const perPage = 5;
const uploadPath = path.resolve(__dirname, '../../uploads');

module.exports = {
    perPage,
    uploadPath
}