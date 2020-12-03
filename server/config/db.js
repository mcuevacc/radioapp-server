const mongoose = require('mongoose');

module.exports = (url) => {
    mongoose.Promise = global.Promise;
    mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        },
        (err, res) => {
            if (err) throw err;
            console.log('Base de datos ONLINE');
        }
    );
    return mongoose;
};