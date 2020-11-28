const fileUpload = require('express-fileupload');

const global = require('../config/global');
const util = require('../utils');
const service = require('../services');
const { validToken } = require('../middlewares/authentication');

let app = require('express')();
app.use(fileUpload());

const prefix = '/upload';

app.post(`${ prefix }/music`, validToken, async(req, res) => {
    try {
        let user = req.user;

        if (!req.files || !req.files.music) {
            return res.status(400).json({
                success: false,
                msg: 'No se ha seleccionado ningún archivo'
            });
        }

        let music = req.files.music;

        if (music.size > global.musicSize) {
            return res.status(400).json({
                success: false,
                msg: 'Archivo demasido grande'
            });
        }

        let extension = util.getExtension(music.name);
        if (!util.validExtension(extension, global.musicExtensions)) {
            return res.status(400).json({
                success: false,
                msg: 'Extension del archivo no válido'
            });
        }

        let folderPath = global.tmpPath;
        service.createPath(folderPath);

        let tmpHashName = util.getRandomString(global.tmpHashLength);
        let tmpMusicName = `${user.id}_${tmpHashName}.${extension}`;
        let tmpMusicPath = `${folderPath}/${tmpMusicName}`;
        await music.mv(`${tmpMusicPath}`);

        let { artist, title } = service.getMusicTags(tmpMusicPath);

        res.json({
            success: true,
            data: {
                file: tmpHashName,
                extension,
                name: music.name,
                artist,
                title,
            }
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            msg: err.message
        });
    }
});

module.exports = app;