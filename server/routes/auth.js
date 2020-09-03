const express = require('express');

const { hashPwd, comparePwd, getToken } = require('../services');
const { validToken } = require('../middlewares/authentication');

let app = express();
let User = require('../models/user');

const prefix = '/auth';

app.post(`${ prefix }/register`, async (req, res) => {
    try {
        let body = req.body;

        let user = new User();
        user.email = body.email;
        user.password = hashPwd(body.password);

        let userDB = await user.save();

        return res.json({
            success: true,
            usuario: userDB,
            token: getToken(userDB)
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            msg: err.message
        });
    }
});

app.post(`${ prefix }/login`, async (req, res) => {
    try {
        let body = req.body;

        let userDB = await User.findOne({ email: body.email });
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

    } catch (err) {
        return res.status(500).json({
            success: false,
            msg: err.message
        });
    }
});

app.post(`${ prefix }/token`, validToken, async (req, res) => {
    try {
        let user = req.user;

        let userDB = await User.findOne({ email: user.email });
        
        res.json({
            success: true,
            usuario: userDB,
            token: getToken(userDB)
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            msg: err.message
        });
    }
});

module.exports = app;