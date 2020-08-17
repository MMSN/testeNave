const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    //testar se ha o header
    const authHeader = req.get('Authorization');
    //se nao existir, erro
    if (!authHeader) {
        const error = new Error('Nao autenticado.');
        error.statusCode = 401;
        throw error;
    }
    //receber apenas o token
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
        //decodar e validar o token
        decodedToken = jwt.verify(token, 'testenavebackend')
    } catch (err) {
        err.statusCode = 500;
        throw err;
    }
    //se nao der para validar o token
    if (!decodedToken) {
        const error = new Error('Nao autenticado.');
        error.statusCode = 401;
        throw error;
    }
    req.userId = decodedToken.userId;
    next();
};