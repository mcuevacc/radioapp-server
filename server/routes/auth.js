const express = require('express');

const { hashPwd, comparePwd, getToken } = require('../services');

let app = express();
let User = require('../models/user');

const prefix = '/auth';

app.post(`${ prefix }/login`, (req, res) => {

    let body = req.body;

    User.findOne({ email: body.email }, (err, userDB) => {
        if (err) {
            return res.status(500).json({
                success: false,
                msg: err.message
            });
        }

        if (!userDB) {
            return res.status(400).json({
                success: false,
                msg: '(Usuario) o contraseña incorrecta'
            });
        }

        if ( !comparePwd(body.password, userDB.password) ) {
            return res.status(400).json({
                success: false,
                msg: 'Usuario o (contraseña) incorrectos'
            });
        }

        res.json({
            success: true,
            usuario: userDB,
            token: getToken(userDB)
        });
    });
});

app.post(`${ prefix }/register`, (req, res) => {

    let body = req.body;

    let user = new User();
    user.email = body.email;
    user.password = hashPwd(body.password);

    user.save((err, userDB) => {
        if (err) {
            return res.status(500).json({
                success: false,
                msg: err.message
            });
        };

        return res.json({
            ok: true,
            usuario: userDB,
            token: getToken(userDB)
        });
    });
});

module.exports = app;