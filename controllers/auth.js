const { validationResult, Result } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = (req, res, next) => {
    //validacao
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validacao falhou.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;

    }
    //dados que serao guardados
    const email = req.body.email;
    const password = req.body.password;
    //hash na senha
    bcrypt.hash(password, 12)
      .then(hashedPw => {
          const user = new User({
              email: email,
              password: hashedPw
          });
          return user.save();
      })
      .then(result => {
          res.status(201).json({message: 'Usuario criado com sucesso', userId: result._id})
      })
      .catch(err => {
          if (!err.statusCode) {
              err.statusCode = 500;
          }
          next(err);
      });
}

exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    User.findOne({email: email})
      .then(user => {
          if (!user) {
              const error = new Error('Nao existe usuario associado a este email.');
              error.statusCode = 401;
              throw error;
          }
          loadedUser = user;
          return bcrypt.compare(password, user.password);
      })
      .then(isEqual => {
          if (!isEqual) {
              const error = new Error('A senha esta errada.');
              error.statusCode = 401;
              throw error;
          }
          //se chegou ate aqui, criar token
          const token = jwt.sign({
              email: loadedUser.email, 
              userId: loadedUser._id.toString()
              }, 
              'testenavebackend', 
              { expiresIn: '1h' }
          );
          res.status(200).json({token: token, userId: loadedUser._id.toString()});
      })
      .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
      })
}