const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let roleValid = {
    values: ['admin', 'user'],
    message: '{VALUE} no es un rol válido'
};

let Schema = mongoose.Schema;

let userSchema = new Schema({
    email: {
        type: String,
        unique: true,
        required: [true, 'El correo es necesario']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria']
    },
    name: {
        type: String,
        required: false
    },    
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        default: 'user',
        enum: roleValid
    },
    isActive: {
        type: Boolean,
        default: true
    },
    facebook: {
        type: Boolean,
        default: false
    },
    google: {
        type: Boolean,
        default: false
    }
});

userSchema.methods.toJSON = function() {
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;
    delete userObject.isActive;

    return userObject;
}

userSchema.plugin(uniqueValidator, { message: 'Debe de ser único' });

module.exports = mongoose.model('User', userSchema);