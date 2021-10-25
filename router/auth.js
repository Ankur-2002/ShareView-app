const router = require('express').Router();
const Auth = require('../controller/auth');
const { body } = require('express-validator');
const user = require('../modal/user');

router.put(
  '/signup',
  [
    body('email')
      .isEmail()
      .withMessage('Enter Valid Email Address')
      .custom(async (value, { req }) => {
        await user
          .findOne({
            email: value,
          })
          .then(res => {
            if (res) return Promise.reject('Email already registered');
          });
      })
      .normalizeEmail(),

    body('password').trim().isLength({ min: 6 }),
    body('name').notEmpty().trim().isLength({ min: 6 }),
  ],

  Auth.Signup
);

router.post('/login', Auth.login);
module.exports = router;
