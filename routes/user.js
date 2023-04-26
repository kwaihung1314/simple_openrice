const app = require('express').Router();
const config = require('../config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userValidation = require('../policies/user/validation');
const userModel = sequelize.model(config.modelNames.user);

// user registration

/**
 * @api {post} /users/register
 * @apiName createUser
 * @apiDescription post a new user to register an account
 * @apiGroup User
 *
 * @apiParam (Request body) {String} username user name.
 * @apiParam (Request body) {String} email user email address.
 * @apiParam (Request body) {String} password user password.
 *
 * @apiSuccessExample {json} Success response:
 * {
 *    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoidXNlcjEyMyIsImVtYWlsIjoidXNlcjFAZW1haWwuY29tIiwiaWF0IjoxNjgyNDY1NTI3fQ.3Xigm-iD2uq3bUGc2unokc1GuKrMdJwNbtBwDm-Tu6o"
 * }
 *
 * @apiError (errorGroup) 400 Bad Request: field(s) missing.
 * @apiError (errorGroup) 500 Internal Server Error: operation failed due to server error.
 */
app.post('/register', userValidation, (req, res) => {
  bcrypt.hash(req.body.password, 10)
    .then((hashPassword) => {
      return userModel.create({
        username: req.body.username,
        email: req.body.email,
        password: hashPassword,
      }, {
        raw: true,
      });
  })
  .then((newUser) => {
    let user = {
      userId: newUser.id,
      username: newUser.username,
      email: newUser.email,
    };
    signToken(user, config.jwtSecret)
      .then((token) => {
        res.send({token});
      });
  })
  .catch((err) => {
    if (err instanceof sequelize.UniqueConstraintError) {
      res.status(400).send('Username or email have already have used.');
    } else {
      res.sendStatus(500);
    }
  });
});

// user login

/**
 * @api {post} /users/login
 * @apiName authUser
 * @apiDescription post user login info to autheticate
 * @apiGroup User
 *
 * @apiParam (Request body) {String} username user name.
 * @apiParam (Request body) {String} password user password.
 *
 * @apiSuccessExample {json} Success response:
 * {
 *    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoidXNlcjEyMyIsImVtYWlsIjoidXNlcjFAZW1haWwuY29tIiwiaWF0IjoxNjgyNDY1NTI3fQ.3Xigm-iD2uq3bUGc2unokc1GuKrMdJwNbtBwDm-Tu6o"
 * }
 *
 * @apiError (errorGroup) 401 Unauthorized: incorrect login info.
 * @apiError (errorGroup) 500 Internal Server Error: operation failed due to server error.
 */
app.post('/login', (req, res) => {
  userModel.findOne({
    where: {
      username: req.body.username,
    },
    raw: true,
  })
  .then((user) => {
    console.log(user);
    if (!user) {
      res.sendStatus(401);
      return;
    }
    return bcrypt.compare(req.body.password, user.password)
      .then((passwordCorrect) => {
        if (!passwordCorrect) {
          res.sendStatus(401);
          return;
        }
        return signToken({
          userId: user.id,
          username: user.username,
          email: user.email,
        }, config.jwtSecret);
      });
  })
  .then((token) => {
    res.send({token});
  })
  .catch((err) => {
    console.log(err);
    res.status(500);
  });
});

function signToken(user, key) {
  return new Promise((resolve, reject) => {
    jwt.sign(user, key, (err, token) => {
      if (err) reject(err);
      resolve(token);
    });
  });
}

module.exports = app;
