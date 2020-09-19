const express = require('express');

const global = require('../config/global');
const service = require('../services');
const { validToken } = require('../middlewares/authentication');
const musicService = require('../services/music-service');

let app = express();
let Music = require('../models/music');

const prefix = '/music';

app.get(`${ prefix }/:id`, validToken, async (req, res) => {
    try {
        let user = req.user;
        let id = req.params.id;

        let music = await Music.findOne({'_id':id, 'user': user.id })
            .populate('user', '_id email name');

        if(!music){
            return res.status(400).json({
                success: false,
                msg: 'Música no existe'
            });
        }

        res.json({
            success: true,
            data: music
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            msg: err.message
        });
    }
});

app.post(`${ prefix }`, validToken, async (req, res) => {
    try {
        let user = req.user;
        let {name, artist, title, file, extension, private} = req.body;

        let musicPath = `${global.tmpPath}/${user.id}_${file}.${extension}`;

        let resp = await musicService.create({
            name, artist, title, extension, private, musicPath, userId: user.id
        });

        if(!resp.success){
            return res.status(resp.status).json({
                success: false,
                msg: resp.msg
            });
        }
        
        res.json(resp);
       
    } catch (err) {
        return res.status(500).json({
            success: false,
            msg: err.message
        });
    }
});

app.put(`${ prefix }/:id`, validToken, async (req, res) => {
    try {
        let user = req.user;
        let id = req.params.id;
        let { name, artist, title, private } = req.body;

        let musicDB = await Music.findOne({ '_id': id, 'user': user.id });
        if(!musicDB){
            return res.status(400).json({
                success: false,
                msg: 'No se ha encontrado la música'
            });
        }

        let musicPath = `${global.musicAudioPath}/${user.id}/${id}.${musicDB.extension}`;
        let tags = { title, artist };
        if(!service.updateMusicTags(tags, musicPath)){
            return res.status(400).json({
                success: false,
                msg: 'Error al establecer los tags'
            });
        }

        musicDB.name = name;
        musicDB.artist = artist;
        musicDB.title = title;
        musicDB.private = private;
        musicDB = await musicDB.save();

        res.json({
            success: true,
            data: musicDB
        });
       
    } catch (err) {
        return res.status(500).json({
            success: false,
            msg: err.message
        });
    }
});

app.delete(`${ prefix }/:id`, validToken, async (req, res) => {
    try {
        let user = req.user;
        let musicId = req.params.id;

        let resp = await musicService.remove({
            musicId, userId: user.id
        });

        if(!resp.success){
            return res.status(resp.status).json({
                success: false,
                msg: resp.msg
            });
        }

        res.json(resp);

    } catch (err) {
        return res.status(500).json({
            success: false,
            msg: err.message
        });
    }
});

module.exports = app;