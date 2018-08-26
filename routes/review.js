const app = require('express').Router();
const sequelize = require('../models');
const config = require('../config');

const reviewModel = sequelize.model(config.modelNames.review);
const imageModel = sequelize.model(config.modelNames.image);
const commentModel = sequelize.model(config.modelNames.comment);

// create a review for a restaurant
// reviewImage - Array of image id
app.post('/', (req, res) => {
    console.log(req.body);
    let review = {
        title: req.body.title || null,
        contents: req.body.contents || null,
        category: req.body.category || null,
        restaurantId: req.body.restaurantId || null,
        owner: 1, // testing
        images: req.body.image || [],
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
        return Promise.all(review.images.map((image) => {
            return imageModel.update({
                restaurantId: review.restaurantId,
                reviewId: newReview.id,
            }, {
                where: {
                    id: image,
                },
            });
        }))
        .then(() => {
            res.send({
                id: newReview.id,
            });
        });
    }).catch((err) => {
        console.log(err);
        res.sendStatus(500);
    });
});

// delete a review
app.delete('/:id', (req, res) => {
    if (!req.params.id) {
        res.sendStatus(400);
        return;
    }
    reviewModel.findById(req.params.id)
    .then((review) => {
        if (!review) {
            res.sendStatus(404);
            return;
        }
        // TODO: check creditial
        review.destroy();
        res.sendStatus(200);
    })
    .catch((err) => {
        console.log(err);
        res.sendStatus(500);
    });
});

// get all reviews of a restaurant given restaurant's unqiue id
app.get('/restaurant/:restaurantId', (req, res) => {
    reviewModel.findAll({
        where: {
            restaurantId: req.params.restaurantId,
        },
        raw: true,
        include: [
            {
                model: imageModel,
                attributes: ['id'],
            },
        ],
    })
    .then((reviews) => {
        res.send(reviews);
    })
    .catch((err) => {
        console.log(err);
        res.sendStatus(500);
    });
});

// get all reviews of the current user
app.get('/user', (req, res) => {
    reviewModel.findAll({
        where: {
            owner: req.user.id,
        },
        raw: true,
        include: [
            {
                model: imageModel,
                attributes: ['id'],
            },
        ],
    })
    .then((reviews) => {
        res.send(reviews);
    })
    .catch((err) => {
        console.log(err);
        res.sendStatus(500);
    });
});

// get a review given review's unique id
app.get('/:id', (req, res) => {
    reviewModel.findById(req.params.id, {
        raw: true,
        include: [commentModel],
    })
    .then((review) => {
        res.send(review);
    })
    .catch((err) => {
        console.log(err);
        res.sendStatus(500);
    });
});

module.exports = app;
