const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const NodeID3 = require('node-id3');
const mp3Duration = require('mp3-duration');
const mv = require('mv');

const { saltHashPwd } = require('../config/global')

const hashPwd = (password) => bcrypt.hashSync(password, saltHashPwd);

const comparePwd = (password, hashedPassword) => bcrypt.compareSync(password, hashedPassword);

const getToken = (user) => {
    let {_id:id, email, role} = user;

    let token = jwt.sign({
        user: {id, email, role}
    }, process.env.JWT_KEY, { expiresIn: process.env.JWT_LIFE });

    return token;
};

const createPath = (folderPath) => {
    if( !fs.existsSync(folderPath) ){
        fs.mkdirSync(folderPath);
    }
}

const getMusicTags = (musicPath) => NodeID3.read(musicPath);

const updateMusicTags = (tags, musicPath) => NodeID3.update(tags, musicPath);

const getMusicDuration = (musicPath) => mp3Duration(musicPath);

const moveFile = (path, newPath) => new Promise(resolve => { mv(path, newPath, {mkdirp: true}, res => resolve(res)) });

const existPathSync = (path) => fs.existsSync(path);

const writeFileSync = (filePath, data) => fs.writeFileSync(filePath, data);

module.exports = {
    comparePwd,
    createPath,
    existPathSync,
    getMusicDuration,
    getMusicTags,
    getToken,
    hashPwd,
    moveFile,
    updateMusicTags,
    writeFileSync
};