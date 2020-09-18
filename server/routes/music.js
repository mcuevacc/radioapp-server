const express = require('express');

const global = require('../config/global');
const util = require('../utils');
const service = require('../services');
const { validToken } = require('../middlewares/authentication');

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
        if (!service.existPathSync(musicPath)) {
            return res.status(400).json({
                success: false,
                msg: 'No se ha encontrado el archivo'
            });
        }

        if(!util.validExtension(extension, global.musicExtensions)){
            return res.status(400).json({
                success: false,
                msg: 'Extension del archivo no válido'
            });
        }

        let tags = { title, artist };
        if(!service.updateMusicTags(tags, musicPath)){
            return res.status(400).json({
                success: false,
                msg: 'Error al establecer los tags'
            });
        }

        let duration = await service.getMusicDuration(musicPath);

        let music = new Music({
            name,
            extension,
            user: user.id,
            artist,
            title,
            duration,
            private
        });

        tags = service.getMusicTags(musicPath);
        if(tags.image){
            let imageName = `${music._id}.${tags.image.mime}`;
            let imagePath = `${global.tmpPath}/${imageName}`;
            service.writeFileSync(imagePath, tags.image.imageBuffer);
            let newImagePath = `${global.musicImagePath}/${user.id}/${imageName}`;
            let error = await service.moveFile(imagePath, newImagePath);
            if(error){
                return res.status(400).json({
                    success: false,
                    msg: 'Error al mover el archivo de imagen'
                });
            }

            music.image = imageName;
        }       

        let newMusicPath = `${global.musicAudioPath}/${user.id}/${music._id}.${music.extension}`;
        let error = await service.moveFile(musicPath, newMusicPath);
        if(error){
            return res.status(400).json({
                success: false,
                msg: 'Error al mover el archivo de audio'
            });
        }

        let musicDB = await music.save();

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

module.exports = app;