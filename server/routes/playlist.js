const express = require('express');

const global = require('../config/global');
const { validToken } = require('../middlewares/authentication');

let app = express();
let PlayList = require('../models/playlist');

const prefix = '/playlist';

app.get(`${ prefix }`, validToken, async (req, res) => {
    try {
        let user = req.user;

        let reqPlayLists = PlayList.find({'user': user.id });

        let page = req.query.page;
        if(page){
            page = Number(page) || 0;
            let perPage = Number(req.query.per_page) || global.perPage;
            reqPlayLists.skip(page * perPage)
                .limit(perPage);
        }

        let playlists = await reqPlayLists.sort('name')
            .populate('user', 'nombre email')
            .exec();

        res.json({
            success: true,
            data: playlists
        });
       
    } catch (err) {
        return res.status(500).json({
            success: false,
            msg: err.message
        });
    }
});

app.get(`${ prefix }/:id`, validToken, async (req, res) => {
    try {
        let user = req.user;
        let id = req.params.id;

        let playList = await PlayList.findOne({'_id':id, 'user': user.id })
            .populate('musicList', '_id name title artist duration')
            .exec();

        if(!playList){
            return res.status(400).json({
                success: false,
                msg: 'PlayList no existe'
            });
        }

        res.json({
            success: true,
            data: playList
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
        let body = req.body;

        let playlist = new PlayList({
            name: body.name,
            user: user.id,
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

app.put(`${ prefix }/:id`, validToken, async (req, res) => {
    try {
        let user = req.user;
        let id = req.params.id;
        let body = req.body;

        let playlistDB = await PlayList.findOneAndUpdate(
            { '_id': id, 'user': user.id },
            { name: body.name },
            { new: true }
        );

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

app.delete(`${ prefix }/:id`, validToken, async (req, res) => {
    try {
        let user = req.user;
        let id = req.params.id;

        let playlistDB = await PlayList.findOneAndRemove(
            { '_id': id, 'user': user.id }
        );

        if(!playlistDB){
            return res.status(400).json({
                success: false,
                msg: 'PlayList no existe'
            });
        }

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