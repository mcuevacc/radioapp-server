const jwt = require('jsonwebtoken');

// ============================
//  Validar Token
// ============================
const validToken = (req, res, next) => {

    let token = req.get('Authorization');

    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                success: false,
                msg: 'Token no válido'
            });
        }
        
        req.user = decoded.user;
        next();
    });
};

module.exports = {
    validToken
}