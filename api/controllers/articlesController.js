//const Article = require('../models/Article');
const con = require("../db");
const validator = require('express-validator');


// Get all
module.exports.list = function (req, res, next) {
  con.query('SELECT *, id as id FROM articles', function (err, results, fields) {
    if(err) {
      return res.status(500).json({
          message: 'Error getting records.',
          err: err
      });
    }

    if(results.length>0){
      return res.json(results);
    }
    else{
      return res.json([]);
    }
  });
}

// Get one
module.exports.show = function(req, res) {
  var id = req.params.id;
  con.query('SELECT *, id as id FROM articles WHERE id=?', [id], function (err, results, fields) {
    if(err) {
      return res.status(500).json({
          message: 'Error getting record.',
          err: err
      });
    }

    if(results.length>0){
      return res.json(results[0]);
    }
    else{
      return res.status(404).json({
        message: 'No such record'
      });
    }
  });
}

// Create
module.exports.create = [
  // validations rules
  validator.body('title', 'Please enter Article Title').isLength({ min: 1 }),
  validator.body('title').custom(value => {
    return new Promise((resolve, reject) => {
      con.query('SELECT * FROM articles WHERE title = ?', [value], function (err, results) {
        if (err) {
          reject(new Error('Server error'));
        }
        if(results.length>0){
          reject(new Error('Title already in use'));
        }
        resolve(true);
      });
    })
  }),
  validator.body('author', 'Please enter Author Name').isLength({ min: 1 }),
  validator.body('body', 'Please enter Article Content').isLength({ min: 1 }),

  function(req, res) {
    // throw validation errors
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.mapped() });
    }

    // initialize record
    const article = {}
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    // save record
    con.query('INSERT INTO articles SET ?', article, function (err, results, fields) {
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


// Update
module.exports.update = [
  // validation rules
  validator.body('title', 'Please enter Article Title').isLength({ min: 1 }),
  validator.body('title').custom((value, {req}) => {
    return new Promise((resolve, reject) => {
      con.query('SELECT * FROM articles WHERE title = ? AND id<>?', [value, req.params.id], function (err, results) {
        if (err) {
          reject(new Error('Server error'));
        }
        if(results.length>0){
          reject(new Error('Title already in use'));
        }
        resolve(true);
      });
    })
  }),
  validator.body('author', 'Please enter Author Name').isLength({ min: 1 }),
  validator.body('body', 'Please enter Article Content').isLength({ min: 1 }),

  function(req, res) {
    // throw validation errors
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.mapped() });
    }

    var id = req.params.id;

    // Update only if record exists
    con.query('SELECT * FROM articles WHERE id=?', [id], function(err, results, fields) {
      if(err) {
        return res.status(500).json({
            message: 'Error getting record.',
            err: err
        });
      }

      // Perform Update if record found
      if(results.length>0){
        const article = results[0];

        // initialize record
        article.title =  req.body.title ? req.body.title : article.title;
        article.author =  req.body.author ? req.body.author : article.author;
        article.body =  req.body.body ? req.body.body : article.body;
        article.date_updated = new Date();

        // save record
        con.query('UPDATE articles SET ? WHERE id=?', [article, id], function (err, results, fields) {
          if (err) {
            return res.status(500).json({
              message: 'Error saving record',
              err: err
            });
          }
          return res.json(article);
        });

      }
      else{
        return res.status(404).json({
          message: 'No such record'
        });
      }
    });
  }
]


// Delete
module.exports.delete = function(req, res) {
  var id = req.params.id;
  // Update only if record exists
  con.query('SELECT * FROM articles WHERE id=?', [id], function(err, results, fields) {
    if(err) {
      return res.status(500).json({
          message: 'Error getting record.',
          err: err
      });
    }

    // Perform delete query
    if(results.length>0){
      // save record
      con.query('DELETE FROM articles WHERE id=?', [id], function (err, results) {
        if (err) {
          return res.status(500).json({
            message: 'Error deleting record',
            err: err
          });
        }
        return res.json({
          message: 'Record deleted'
        });
      });

    }
    else{
      return res.status(404).json({
        message: 'No such record'
      });
    }
  });
}
