const app = require('express').Router();
const sequelize = require('../models');
const config = require('../config');

const reviewModel = sequelize.model(config.modelNames.review);

// create a review for a restaurant
app.post('/', (req, res) => {
    let review = {
        title: req.body.title || null,
        contents: req.body.contents || null,
        category: req.body.category || null,
        restaurantId: req.body.restaurantId || null,
        owner: null,
    };
    if (!review.title || !review.contents || !review.category || !review.restaurantId) {
        res.sendStatus(400);
        return;
    }
    reviewModel.create({
        title: review.title,
        contents: review.contents,
        category: review.category,
        restaurantId: review.restaurantId,
        owner: review.owner,
    }).then((newReview) => {
        res.send({
            id: newReview.id,
        });
    }).catch((err) => {
        console.log(err);
        res.sendStatus(500);
    });
});

module.exports = app;
