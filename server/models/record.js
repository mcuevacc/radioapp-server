const mongoose = require('mongoose');

let extensionValid = {
    values: ['mp3'],
    message: '{VALUE} no es una extensión válida'
};

let Schema = mongoose.Schema;

let recordSchema = new Schema({
    name: {
        type: String,
        required: [true, 'El nombre es necesario'],
        trim: true
    },
    extension: {
        type: String,
        default: 'mp3',
        enum: extensionValid
    },
    duration: {
        type: Number,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El usuario es necesario']
    },  
    created: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Record', recordSchema);