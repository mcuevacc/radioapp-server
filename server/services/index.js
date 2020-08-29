const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const salt = 10;

const hashPwd = (password) => bcrypt.hashSync(password, salt);

const comparePwd = (password, hashedPassword) => bcrypt.compareSync(password, hashedPassword);

const getToken = (user) => {
    let {_id:id ,email ,role} = user;

    let token = jwt.sign({
        user: {id, email, role}
    }, process.env.JWT_KEY, { expiresIn: process.env.JWT_LIFE });

    return token;
};

module.exports = {
    hashPwd,
    comparePwd,
    getToken
}