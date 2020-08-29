const express = require('express');
const fs= require('fs');
const mv = require('mv');
const path = require('path');
const NodeID3 = require('node-id3');

const { readSongs } = require('../utils');

let app = express();
let Music = require('../models/music');


app.get('/load/:folderName', async (req, res) => {

    let folderName = req.params.folderName;

    let folderPath = path.resolve(__dirname, `../../uploads/new/${ folderName }`);

    if ( !fs.existsSync(folderPath)) {
        return res.status(400).json({
                success: false,
                msg: 'No se ha encontrado la carpeta'
            });
    }

    /*
    let music = new Music({
        name: "music",
        extension: "mp3",
        title: "dadsad",
        artist: "dasdsadsad"
    });

    music.save((err, musicObject) => {
        if (err) {
            throw err
        }
        
        var oldPath = `${ folderPath }/${ musicObject.name }.${ musicObject.extension }`
        var newPath = path.resolve(__dirname, `../../uploads/music/1234/${ musicObject._id }.${ musicObject.extension }`);

        mv(oldPath, newPath, {mkdirp: true}, function(err) {
            if (err) {
                throw err
            }
            console.log('Successfully renamed - AKA moved!')
        })
    });
    */

    let songs = readSongs(folderPath);
    songs.forEach(song => {
        let tag = NodeID3.read(`${ folderPath }/${ song.name }`)
        let music = new Music({
            name: path.basename(song.name, song.extension),
            extension: song.extension,
            title: tag.title,
            artist: tag.artist
        });

        music.save((err, musicObject) => {
            if (err) throw err;
            
            var oldPath = `${ folderPath }/${ musicObject.name }${ musicObject.extension }`
            var newPath = path.resolve(__dirname, `../../uploads/music/1234/${ musicObject._id }${ musicObject.extension }`);

            mv(oldPath, newPath, {mkdirp: true}, function(err) {
                if (err) throw err;
            })
        });
    
    });

    res.status(200).json({
        ok: true,
    });
});


module.exports = app;