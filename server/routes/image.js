const global = require('../config/global');
const service = require('../services');
const { validToken } = require('../middlewares/authentication');

let app = require('express')();

const prefix = '/image';

app.get(`${ prefix }/music/:user/:image`, validToken, async(req, res) => {
    try {
        let userId = req.params.user;
        let image = req.params.image;

        let imagePath = `${global.musicImagePath}/${userId}/${image}`;
        if (!service.existPathSync(imagePath)) {
            return res.status(400).json({
                success: false,
                msg: 'Archivo de imagen no encontrado'
            });
        }

        res.sendFile(imagePath);

    } catch (err) {
        return res.status(500).json({
            success: false,
            msg: err.message
        });
    }
});

module.exports = app;