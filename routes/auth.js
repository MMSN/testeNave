const express = require('express');
const { body } = require('express-validator/check');

const User = require('../models/user');
const authController = require('../controllers/auth');

const router = express.Router();

router.put('/signup', [
    body('email')
      .isEmail()
      .withMessage('Entre um email valido.')
      .custom((value, { req }) => {
          return User.findOne({email: value}).then(userDoc => {
              if (userDoc) {
                  return Promise.reject('Email ja esta em uso.');
              }
          })
      })
    .normalizeEmail(),
    body('password')
      .trim()
      .isLength({min: 5})
], authController.signup);

router.post('/login', authController.login);

module.exports = router;