const { validToken } = require('../../middlewares/authentication');

let app = require('express')();

const prefix = '/radio/server';

app.get(`${ prefix }/metadata`, async(req, res) => {
    try {
        let { radio } = require('../../server');
        if (!radio.isPlaying) {
            return res.status(500).json({
                success: false,
                msg: 'Radio not is playing'
            });
        }

        let data = radio.getMetadata();
        res.json({
            success: true,
            data
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            msg: err.message
        });
    }
});

app.post(`${ prefix }/play`, validToken, async(req, res) => {
    try {
        let { radio } = require('../../server');
        res.json(await radio.playMusic());

    } catch (err) {
        return res.status(500).json({
            success: false,
            msg: err.message
        });
    }
});

app.post(`${ prefix }/stop`, validToken, async(req, res) => {
    try {
        let { radio } = require('../../server');
        res.json(radio.stopMusic());

    } catch (err) {
        return res.status(500).json({
            success: false,
            msg: err.message
        });
    }
});

app.post(`${ prefix }/skip`, validToken, async(req, res) => {
    try {
        let { radio } = require('../../server');
        res.json(radio.skipMusic());

    } catch (err) {
        return res.status(500).json({
            success: false,
            msg: err.message
        });
    }
});

module.exports = app;