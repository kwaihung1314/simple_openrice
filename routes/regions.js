const app = require('express').Router();
const config = require('../config');
const regionModel = sequelize.model(config.modelNames.region);

// get all region
app.get('/', (req, res) => {
    regionModel.findAll({
        raw: true,
    })
    .then((regions) => {
        res.send(regions);
    })
    .catch((err) => {
        console.log(err);
        res.sendStatus(500);
    });
});

module.exports = app;
