var express = require('express');
var router = express.Router();

const sequelize = require('../model');
const restaurantModel = sequelize.model('Restaurant');

/* GET home page. */
router.get('/', function(req, res, next) {
  restaurantModel.findAll()
    .then(() => {
      console.log('fetch in restaurant table.');
    });
  res.render('index', { title: 'Express' });
});

module.exports = router;
