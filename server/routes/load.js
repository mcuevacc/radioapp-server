const express = require('express');
const fs= require('fs');
const mv = require('mv');
const path = require('path');
const mp3Duration = require('mp3-duration');
const NodeID3 = require('node-id3');

const global = require('../config/global');
const { validToken } = require('../middlewares/authentication');
const { readSongs } = require('../utils');

let app = express();
let Music = require('../models/music');
let PlayList = require('../models/playlist');

app.post('/load/:folderName', validToken, async (req, res) => {
    try {
        let user = req.user;
        let folderName = req.params.folderName;

        let folderPath = `${ global.uploadPath }/new/${ folderName }`
        if ( !fs.existsSync(folderPath)) {
            return res.status(400).json({
                    success: false,
                    msg: 'No se ha encontrado la carpeta'
                });
        }

        let playlist = new PlayList({
            name: folderName,
            user: user.id,
        });

        let playlistDB = await playlist.save();

        let songs = readSongs(folderPath);
        songs.forEach(song => {
            let musicPath = `${ folderPath }/${ song.name }`;

            mp3Duration(musicPath, async function (err, duration) {
                if (err) return console.log(err.message);

                let tag = NodeID3.read(musicPath);

                let music = new Music({
                    name: path.basename(song.name, song.extension),
                    extension: song.extension,
                    user: user.id,
                    title: tag.title,
                    artist: tag.artist,
                    duration
                });

                let musicDB = await music.save();

                let newPath = `${ global.uploadPath }/music/${ user.id }/${ musicDB._id }${ musicDB.extension }`;
                mv(musicPath, newPath, {mkdirp: true}, function(err) {
                    if (err) return console.log(err.message);
                })

                playlistDB.musicList.push(musicDB._id);

                playlistDB.save();
            });       
        });
        
        res.json({
            success: true,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            msg: err.message
        });
    }
});

module.exports = app;