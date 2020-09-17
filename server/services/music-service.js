const global = require('../config/global');

let Music = require('../models/music');
let Util = require('../utils')

create = async (file, user) => {
    try {
        if(typeof file !== 'object'){
            return {
                success: false,
                msg: 'Archivo no definido'
            };
        }

        

        /*
        // Extensiones permitidas
        let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

        if (extensionesValidas.indexOf(extension) < 0) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Las extensiones permitidas son ' + extensionesValidas.join(', '),
                    ext: extension
                }
            })
        }
        */



        return {
            success: true,
        }

    } catch (err) {
        return {
            success: false,
            msg: err.message
        };
    }
}

module.exports = {
    create
};