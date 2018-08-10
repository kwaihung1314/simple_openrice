const app = require('express').Router();
const sequelize = require('../models');
const config = require('../config');

const userValidation = require('../policies/user/validation');
const userModel = sequelize.model(config.modelNames.user);

// user registration
app.post('/register', userValidation, (req, res) => {
    res.sendStatus(200);
});

module.exports = app;
