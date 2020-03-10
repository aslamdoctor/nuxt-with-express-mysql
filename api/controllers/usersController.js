const con = require("../db");
const config = require('../config')
//const User = require('../models/User')
const validator = require('express-validator')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs')


// Register
module.exports.register = [
  // validations rules
  validator.body('full_name', 'Please enter Full Name').isLength({ min: 1 }),
  validator.body('email', 'Please enter Email').isLength({ min: 1 }),
  validator.body('email').custom(value => {
    return new Promise((resolve, reject) => {
      con.query('SELECT * FROM users WHERE email = ?', [value], function (err, results) {
        if (err) {
          reject(new Error('Server error'));
        }
        if(results.length>0){
          reject(new Error('Email already in use'));
        }
        resolve(true);
      });
    })
  }),
  validator.body('password', 'Please enter Password').isLength({ min: 1 }),

  function(req, res) {
    // throw validation errors
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.mapped() });
    }

    // initialize record
    const user = {}
    user.full_name = req.body.full_name;
    user.email = req.body.email;
    user.password = req.body.password;

    // encrypt password
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(user.password, salt);
    user.password = hash

    // save record
    con.query('INSERT INTO users SET ?', user, function (err, results, fields) {
      if (err) {
        return res.status(500).json({
          message: 'Error saving record',
          err: err
        });
      }
      return res.json({
          message: 'saved',
          id: results.insertId
      });
    });
  }
]


// Login
module.exports.login = [
  // validation rules
  validator.body('email', 'Please enter Email').isLength({ min: 1 }),
  validator.body('password', 'Please enter Password').isLength({ min: 1 }),

  function(req, res) {
    // throw validation errors
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.mapped() });
    }

    // validate email and password are correct
    con.query('SELECT * FROM users WHERE email=?', [req.body.email], function(err, results, fields) {
      if(err) {
        return res.status(500).json({
            message: 'Error logging in',
            err: err
        });
      }

      // Perform Update if record found
      if(results.length>0){
        const user = results[0];

        // compare submitted password with password inside db
        return bcrypt.compare(req.body.password, user.password, function(err, isMatched) {
          if(isMatched===true){
            return res.json({
              user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name
              },
              token: jwt.sign({id: user.id, email: user.email, full_name: user.full_name}, config.authSecret) // generate JWT token here
            });
          }
          else{
            return res.status(500).json({
              message: 'Invalid Email or Password entered.'
            });
          }
        });
      }
      else{
        return res.status(500).json({
          message: 'Invalid Email or Password entered.'
        });
      }
    });

  }
]


// Get User
module.exports.user = function(req, res) {
  var token = req.headers.authorization
  if (token) {
    // verifies secret and checks if the token is expired
    jwt.verify(token.replace(/^Bearer\s/, ''), config.authSecret, function(err, decoded) {
      if (err) {
        return res.status(401).json({message: 'unauthorizd'})
      } else {
        return res.json({ user: decoded })
      }
    });
  }
  else{
    return res.status(401).json({message: 'unauthorizd'})
  }
}
