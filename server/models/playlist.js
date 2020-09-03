const mongoose = require('mongoose');

var Schema = mongoose.Schema;

var playListSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El usuario es necesario']
    },
    name: {
        type: String,
        required: [true, 'El nombre es necesario'],
        trim: true
    },
    musicList: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Music',
        }
    ],
    created: {
        type: Date,
        default: Date.now,
    },
});

playListSchema.index({'user':1, 'name':1}, { unique: true });

module.exports = mongoose.model('PlayList', playListSchema);