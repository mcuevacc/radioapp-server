const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let typeValid = {
    values: ['music', 'audio'],
    message: '{VALUE} no es un tipo valido'
};
 
var Schema = mongoose.Schema;

var queueSchema = new Schema({
    type: {
        type: String,
        default: 'music',
        enum: typeValid
    },
    music: {
        type: Schema.Types.ObjectId,
        ref: 'Music',
        require: false
    },
    audio: {
        type: Schema.Types.ObjectId,
        ref: 'Audio',
        require: false
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El usuario es necesario']
    }
});

var radioListSchema = new Schema({
    cod: {
        type: String,
        unique: true,
        required: [true, 'El codigo es necesario'],
    },
    queueList: [queueSchema]
});

radioListSchema.plugin(uniqueValidator, { message: 'Debe de ser único' });

module.exports = mongoose.model('RadioList', radioListSchema);