const app = require('express').Router();
const config = require('../config');
const regionModel = sequelize.model(config.modelNames.region);

// get all region
/**
 * @api {get} /region list all regions
 * @apiName listAllRegion
 * @apiDescription list all regions
 * @apiGroup Region
 *
 * @apiSuccessExample {json} Success response:
 * [
 *  {
 *      id: 2,
 *      name: "Kowloon",
 *  },
 * ]
 * 
 * @apiError (errorGroup) 500 Internal Server Error: request failed due to server error.
 */
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
