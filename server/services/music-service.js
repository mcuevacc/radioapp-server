const global = require('../config/global');
const util = require('../utils');
const service = require('../services');

let Music = require('../models/music');

const create = async (params) => {
    try {
        let {name, artist, title, extension, private, musicPath, userId} = params;

        if (!service.existPathSync(musicPath)) {
            return {
                success: false,
                msg: 'No se ha encontrado el archivo',
                status: 400
            };
        }

        if(!util.validExtension(extension, global.musicExtensions)){
            return {
                success: false,
                msg: 'Extension del archivo no válido',
                status: 400
            };
        }

        let tags = service.getMusicTags(musicPath);
        if(!artist || !title){
            artist = artist || tags.artist;
            title = title || tags.title;
        }else if(!service.updateMusicTags({artist, title}, musicPath)){
            return {
                success: false,
                msg: 'Error al establecer los tags',
                status: 400
            };
        }       

        let duration = await service.getMusicDuration(musicPath);

        let music = new Music({
            name,
            extension,
            user: userId,
            artist,
            title,
            duration,
            private
        });

        if(tags.image){
            let imageName = `${music._id}.${tags.image.mime}`;
            let imagePath = `${global.tmpPath}/${imageName}`;
            service.writeFileSync(imagePath, tags.image.imageBuffer);
            let newImagePath = `${global.musicImagePath}/${userId}/${imageName}`;
            let error = await service.moveFile(imagePath, newImagePath);
            if(error){
                return {
                    success: false,
                    msg: 'Error al mover el archivo de imagen',
                    status: 400
                };
            }

            music.image = imageName;
        }       

        let newMusicPath = `${global.musicAudioPath}/${userId}/${music._id}.${music.extension}`;
        let error = await service.moveFile(musicPath, newMusicPath);
        if(error){
            return {
                success: false,
                msg: 'Error al mover el archivo de audio',
                status: 400
            };
        }

        let musicDB = await music.save();

        return {
            success: true,
            data: musicDB
        }

    } catch (err) {
        return {
            success: false,
            msg: err.message,
            status: 500
        };
    }
};

const remove = async (params) => {
    try {
        let {musicId, userId} = params;
        
        let musicDB = await Music.findOneAndDelete(
            { '_id': musicId, 'user': userId }
        );

        if(!musicDB){
            return {
                success: false,
                msg: 'Music no existe',
                status: 400
            };
        }

        let musicPath = `${global.musicAudioPath}/${userId}/${musicId}.${musicDB.extension}`;
        if(service.existPathSync(musicPath)) {
            service.deleteFileSync(musicPath);
        }

        if(musicDB.image){
            let imagePath = `${global.musicImagePath}/${userId}/${musicDB.image}`;
            if(service.existPathSync(imagePath)) {
                service.deleteFileSync(imagePath);
            }
        }

        return {
            success: true
        }

    } catch (err) {
        return {
            success: false,
            msg: err.message,
            status: 500
        };
    }
};

module.exports = {
    create,
    remove
};