const Token = require('jsonwebtoken');

exports.isAuth = (req, res, next) => {
  if (!req.header('Authorization')) {
    const err = new Error('Authentication Failed');
    err.statusCode = 404;
    throw err;
  }

  const token = req.header('Authorization').split(' ')[1];

  let check;
  try {
    check = Token.verify(token, 'abchsjfhluerw290834hcwe');
  } catch (error) {
    // const err = new Error('Authentication Failed');

    throw error;
  }
  if (!check) {
    const err = new Error('Authentication Failed');
    throw err;
  }

  req.userId = check.userId;

  next();
};
