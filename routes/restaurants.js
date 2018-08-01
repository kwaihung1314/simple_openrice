const app = require('express').Router();
const config = require('../config');
const fs = require('fs');

const sequelize = require('../models');
const restaurantModel = sequelize.model(config.modelNames.restaurant);
const imageModel = sequelize.model(config.modelNames.image);
const regionModel = sequelize.model(config.modelNames.region);

const hasha = require('hasha');

const multer = require('multer');
const upload = multer({
    dest: 'public/images',
});
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];

/**
 * @api {post} /restaurants
 * @apiName: createRestaurant
 * @apiDescription: post a new restaurant
 * @apiGroup Restaurants
 *
 * @apiParam (Request body) {File} file File to upload using HTML forms.
 * @apiParam (Request body) {String} name Restaurant name.
 * @apiParam (Request body) {String} address Restaurant address.
 * @apiParam (Request body) {String} region Region the restaurant belongs to.
 *
 * @apiSuccessExample {json} Success response: object with the IDs of the created restaurant and profile picture
 *
 * @apiError (errorGroup) 400 Bad Request: field(s) missing.
 * @apiError (errorGroup) 415 Unsupported Media Type.
 * @apiError (errorGroup) 500 Internal Server Error: operation failed due to server error.
 */
app.post('/', upload.single('file'), function createRestaurant(req, res, next) {
    let restaurant = {
        name: req.body.name || null,
        address: req.body.address || null,
        regionId: parseInt(req.body.region) || null,
    };
    if (!req.body.name || !req.body.address || !req.body.region) {
        res.sendStatus(400);
        return;
    }
    let storePicPromise;
    if (req.file) {
        // check file type
        if (!allowedImageTypes.includes(req.file.mimetype)) {
            res.sendStatus(415);
            fs.unlink(req.file.path, (err) => {
                if (err) throw err;
            });
            return;
        }
        storePicPromise = hasha.fromFile(req.file.path, {algorithm: 'md5'})
            .then((hash) => {
                // check if there exist the same file
                return imageModel.findById(hash)
                .then((img) => {
                    if (!img) {
                        fs.rename(req.file.path, req.file.destination + '/' + hash, (err) => {
                            if (err) throw err;
                        });
                    } else {
                        fs.unlink(req.file.path, (err) => {
                            if (err) throw err;
                        });
                    }
                    return imageModel.upsert({
                        id: hash,
                        name: req.file.originalname,
                    }).then(() => {
                        return hash;
                    });
                });
            });
    } else {
        storePicPromise = Promise.resolve();
    }

    storePicPromise
        .then((image) => {
            // create restaurant
            return restaurantModel.create({
                name: restaurant.name,
                address: restaurant.address,
                regionId: restaurant.regionId,
                profilePic: image || null,
            })
            .then((result) => {
                res.send({
                    id: result.id,
                    profilePic: image || null,
                });
            });
        })
        .catch((err) => {
            console.log('Error creating new restaurant: ', err);
        });
});

/**
 * @api {put} /restaurants/:id Update a restaurant given unique restaurant id
 * @apiName: updateRestaurant
 * @apiDescription: Update a restaurant
 * @apiGroup Restaurants
 *
 * @apiParam (Request body) {File} file File to upload using HTML forms.
 * @apiParam (Request body) {String} name Restaurant name.
 * @apiParam (Request body) {String} address Restaurant address.
 * @apiParam (Request body) {String} region Region the restaurant belongs to.
 *
 * @apiSuccessExample {json} Success response: object with the IDs of the created restaurant and profile picture
 *
 * @apiError (errorGroup) 400 Bad Request: field(s) missing.
 * @apiError (errorGroup) 415 Unsupported Media Type.
 * @apiError (errorGroup) 500 Internal Server Error: operation failed due to server error.
 */
app.put('/:id', upload.single('file'), function updateRestaurant(req, res) {
    let restaurant = {
        name: req.body.name || null,
        address: req.body.address || null,
        regionId: parseInt(req.body.region) || null,
    };
    if (!req.body.name || !req.body.address || !req.body.region) {
        res.sendStatus(400);
        return;
    }
    let storePicPromise;
    if (req.file) {
        // check file type
        if (!allowedImageTypes.includes(req.file.mimetype)) {
            res.sendStatus(415);
            fs.unlink(req.file.path, (err) => {
                if (err) throw err;
            });
            return;
        }
        storePicPromise = hasha.fromFile(req.file.path, {algorithm: 'md5'})
            .then((hash) => {
                // check if there exist the same file
                return imageModel.findById(hash)
                .then((img) => {
                    if (!img) {
                        fs.rename(req.file.path, req.file.destination + '/' + hash, (err) => {
                            if (err) throw err;
                        });
                    } else {
                        fs.unlink(req.file.path, (err) => {
                            if (err) throw err;
                        });
                    }
                    return imageModel.upsert({
                        id: hash,
                        name: req.file.originalname,
                    }).then(() => {
                        return hash;
                    });
                });
            });
    } else {
        storePicPromise = Promise.resolve();
    }

    storePicPromise
        .then((image) => {
            restaurantModel.findById(req.params.id)
                .then((oldRestaurant) => {
                    return oldRestaurant.update({
                        name: restaurant.name,
                        address: restaurant.address,
                        regionId: restaurant.regionId,
                        profilePic: image || oldRestaurant.profilePic,
                    }).then(() => {
                        res.send({
                            id: req.params.id,
                            profilePic: image || oldRestaurant.profilePic,
                        });
                    });
                });
        })
        .catch((err) => {
            console.log('Error updating restaurant: ', err);
        });
});

/**
 * @api {get} /restaurants list all restaurant
 * @apiName: listAllRestaurant
 * @apiDescription: list all restaurants given the criteria
 * @ apiGroup: Restaurants
 *
 * @apiParam (Query String) {String} q keywords to search for restaurant name.
 * @apiParam (Query String) {Number} regionId filter by region.
 * @apiParam (Query String) {Number} [limit=50] limit.
 * @apiParam (Query String) {Number} [offset=0] number of row to skip.
 * @apiParam (Query String) {String='name','create','update'} [order='name'] row sorting by.
 * @apiParam (Query String) {String="true","false"} [reverse=false] Whether to sort in descending order.
 *
 * @apiSuccessExample {json} Success response:
 * [
 *  {
 *      id: 100,
 *      name: 'abc restaurant',
 *      regionName: 'Mongkok',
 *        
 *  },
 * ]
 */
module.exports = app;
