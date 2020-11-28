const shuffle = (a) => {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const getExtension = (name) => name.split('.').slice(-1).pop();

const validExtension = (extension, validExtensions) => validExtensions.includes(extension);

function isFileWithExtension(item) {
    let valid = true;
    if (this.extensions) {
        valid = validExtension(getExtension(item.name), this.extensions);
    }
    return item.isFile && valid;
};

const getRandomString = (length) => {
    let characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

//exports.readSong = () => _readDir().filter(_isMp3)[0].name;

//exports.discardFirstWord = str => str.substring(str.indexOf(' ') + 1);
//exports.getFirstWord = str => str.split(' ')[0];

//exports.generateRandomId = () => Math.random().toString(36).slice(2);

module.exports = {
    getExtension,
    getRandomString,
    isFileWithExtension,
    shuffle,
    validExtension
};