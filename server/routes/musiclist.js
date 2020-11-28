const { validToken } = require('../middlewares/authentication');

let app = require('express')();
let Music = require('../models/music');
let PlayList = require('../models/playlist');

const prefix = '/musiclist';

app.put(`${ prefix }/add`, validToken, async(req, res) => {
    try {
        let user = req.user;
        let { playlist, music } = req.body;

        let playlistDB = await PlayList.findOne({ '_id': playlist, 'user': user.id });
        if (!playlistDB) {
            return res.status(400).json({
                success: false,
                msg: 'PlayList no existe'
            });
        }

        let musicDB = await Music.findOne({ '_id': music })
            .populate('user', 'privateMusic');
        if (!musicDB) {
            return res.status(400).json({
                success: false,
                msg: 'Music no existe'
            });
        }

        if ((musicDB.private || musicDB.user.privateMusic) && musicDB.user._id.toString() !== user.id) {
            return res.status(400).json({
                success: false,
                msg: 'No tiene permiso para el audio'
            });
        }

        if (playlistDB.musicList.includes(music)) {
            return res.status(400).json({
                success: false,
                msg: 'Ya se ha agregado esa musica'
            });
        }

        playlistDB.musicList.push(music);
        playlistDB = await playlistDB.save();

        res.json({
            success: true
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            msg: err.message
        });
    }
});

module.exports = app;