const mongoose = require('mongoose');

let PlayList = require('../models/playlist');

let extensionValid = {
    values: ['mp3'],
    message: '{VALUE} no es una extensión válida'
};

let Schema = mongoose.Schema;

let musicSchema = new Schema({
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
    artist: {
        type: String,
        required: false,
        trim: true
    },
    title: {
        type: String,
        required: false,
        trim: true
    },
    duration: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        default: ''
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El usuario es necesario']
    },
    private: {
        type: Boolean,
        default: false
    },
});

musicSchema.post("findOneAndDelete", async (music) => {
    if (music) {
        const updateResult = await PlayList.updateMany(
            { musicList: { '$in' : [music._id]} },
            { $pull: { musicList: music._id }}
         );

        console.log("PlayList update result for delete music: ", updateResult);
    }
});

module.exports = mongoose.model('Music', musicSchema);