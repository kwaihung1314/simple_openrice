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
    dest: 'public/images'
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
app.post('/', upload.single('file'), function createRestaurant(req, res, next){
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
        if(!allowedImageTypes.includes(req.file.mimetype)) {
            res.sendStatus(415);
            fs.unlink(req.file.path, err => {
                if (err) throw err;
            });
            return;
        }
        storePicPromise = hasha.fromFile(req.file.path, {algorithm: 'md5'})
            .then((hash) => {
                // check if there exist the same file
                return imageModel.findById(hash)
                .then(img => {
                    if (!img) {
                        fs.rename(req.file.path, req.file.destination + "/" + hash, err => {
                            if (err) throw err;
                        })
                    } else {
                        fs.unlink(req.file.path, err => {
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
            })
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
                })
            })
        })
        .catch((err) => {
            console.log('Error creating new restaurant: ', err);
        })
});

module.exports = app;