const User = require('../modal/user');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const user = require('../modal/user');
const Token = require('jsonwebtoken');
exports.Signup = (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    const err = new Error('Something Went Wrong');
    err.statusCode = 404;
    throw err;
  }
  console.log(error, 'ankur ');

  const pass = req.body.password;
  const name = req.body.name;
  const email = req.body.email;

  bcrypt
    .hash(pass, 12)
    .then(password => {
      const createUser = new User({
        name: name,
        email: email,
        password: password,
        post: [],
      });

      return createUser.save();
    })
    .then(ress => {
      res.status(201).json({
        message: 'Success',
        userId: ress._id,
      });
    })
    .catch(err => {
      err.statusCode = 500;
      next(err);
    });

  return 0;
};
exports.login = (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    const err = new Error('Something Went Wrong');
    err.statusCode = 404;
    throw err;
  }
  // console.log(error, 'ankur ');
  const password = req.body.password;
  const email = req.body.email;
  user.findOne({ email: email }).then(ress => {
    if (!ress) {
      const err = new Error('User Not Found');
      err.statusCode = 404;
      next(err);
    }
    bcrypt
      .compare(password, ress.password)
      .then(boolean => {
        if (!boolean) {
          const err = new Error('Wrong Password');
          err.statusCode = 404;
          throw err;
        }
        const token = Token.sign(
          {
            email: email,
            userId: ress._id.toString(),
          },
          'abchsjfhluerw290834hcwe',
          { expiresIn: '1h' }
        );
        res.status(200).json({
          token: token,
          userId: ress._id.toString(),
        });
      })
      .catch(err => next(err));
  });
};
