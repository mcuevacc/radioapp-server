const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let audioSchema = new Schema({
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

module.exports = mongoose.model('Audio', audioSchema);