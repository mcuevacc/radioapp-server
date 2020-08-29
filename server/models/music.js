const mongoose = require('mongoose');

let extensionValid = {
    values: ['.mp3'],
    message: '{VALUE} no es una extensión válida'
};

let Schema = mongoose.Schema;

let musicSchema = new Schema({
    name: {
        type: String,
        required: [true, 'El nombre es necesa']
    },
    extension: {
        type: String,
        default: 'mp3',
        enum: extensionValid
    },
    artist: {
        type: String,
        required: false
    },
    title: {
        type: String,
        required: false
    },
    //categoria: { type: Schema.Types.ObjectId, ref: 'Categoria', required: true },
    //usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' }
});

module.exports = mongoose.model('Music', musicSchema);