const express = require('express');
const mediaserver = require('mediaserver');

const global = require('../config/global');
const service = require('../services');
const { validToken } = require('../middlewares/authentication');

let app = express();
let Music = require('../models/music');

const prefix = '/play';

app.get(`${ prefix }/music/:id`, validToken, async (req, res) => {
    try {
        let user = req.user;
        let id = req.params.id;

        let music = await Music.findOne({'_id':id})
            .exec();

        if(!music){
            return res.status(400).json({
                success: false,
                msg: 'Música no existe'
            });
        }

        if(music.private && music.user.toString()!==user.id){
            return res.status(400).json({
                success: false,
                msg: 'No tiene permiso para escuchar el audio'
            });
        }
        
        let musicPath = `${global.musicAudioPath}/${music.user}/${ music._id }.${ music.extension}`;
        if ( !service.existPathSync(musicPath)) {
            return res.status(400).json({
                success: false,
                msg: 'Archivo de música no encontrado'
            });
        }

        mediaserver.pipe(req, res, musicPath);
       
    } catch (err) {
        return res.status(500).json({
            success: false,
            msg: err.message
        });
    }
});

module.exports = app;