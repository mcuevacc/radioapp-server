const express = require('express');

const global = require('../config/global');
const util = require('../utils');
const service = require('../services');
const { validToken } = require('../middlewares/authentication');
const musicService = require('../services/music-service');

let app = express();
let PlayList = require('../models/playlist');

app.post('/load/:folderName', validToken, async (req, res) => {
    try {
        let user = req.user;
        let folderName = req.params.folderName;

        let folderPath = `${ global.uploadRootPath }/new/${ folderName }`;
        if ( !service.existPathSync(folderPath)) {
            return res.status(400).json({
                success: false,
                msg: 'No se ha encontrado la carpeta'
            });
        }

        let playlist = new PlayList({
            name: folderName,
            user: user.id,
        });

        let musics = service.getAllFileDir(folderPath, global.musicExtensions);

        let promises = [];
        musics.forEach(musicName => {
            let extension = util.getExtension(musicName);
            let name = musicName.substring(0, musicName.length-extension.length-1)
            let musicPath = `${ folderPath }/${ musicName }`;

            promises.push(musicService.create({name, extension, private:false, musicPath, userId:user.id}));
        });

        let respPromises = await Promise.all(promises);
        respPromises.forEach(resp => {
            if(!resp.success){
                console.log(resp.msg);
            }else{
                playlist.musicList.push(resp.data._id);
            }
        });
        let playlistDB = await playlist.save();

        res.json({
            success: true,
            data: playlistDB
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            msg: err.message
        });
    }
});

module.exports = app;