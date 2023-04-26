const app = require('express').Router();
const config = require('../config');

const reviewModel = sequelize.model(config.modelNames.review);
const imageModel = sequelize.model(config.modelNames.image);
const commentModel = sequelize.model(config.modelNames.comment);
const restaurantModel = sequelize.model(config.modelNames.restaurant);

// create a review for a restaurant
// reviewImage - Array of image id

/**
 * @api {post} /review
 * @apiName createReview
 * @apiDescription post a new review
 * @apiGroup Review
 *
 * @apiParam (Request body) {String} title Review title.
 * @apiParam (Request body) {String} contents Review content.
 * @apiParam (Request body) {Number} category Review category with '-1' is bad, '0' is ok, '1' is good.
 * @apiParam (Request body) {String} restaurantId Restaurant the review belongs to.
 * @apiParam (Request body) {String} userId User that own the review.
 * @apiParam (Request body) {String[]} image List of images id for this review.
 *
 * @apiSuccessExample {json} Success response:
 * {
 *      "id": 4
 * }
 *
 * @apiError (errorGroup) 400 Bad Request: field(s) missing.
 * @apiError (errorGroup) 500 Internal Server Error: operation failed due to server error.
 */
app.post('/', (req, res) => {
    let review = {
        title: req.body.title || null,
        contents: req.body.contents || null,
        category: req.body.category || null,
        restaurantId: req.body.restaurantId || null,
        owner: req.body.userId,
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

/**
 * @api {delete} /review/:id Delete a review with the given ID
 * @apiName deleteReview
 * @apiDescription Delete a review
 * @apiGroup Review
 *
 * @apiParam (URL Parameter) {Number} id Review unique ID.
 *
 * @apiError (errorGroup) 400 Bad Resquest Invalid review ID.
 * @apiError (errorGroup) 404 Not Found Review not found.
 * @apiError (errorGroup) 500 Internal Server Error: request failed due to server error.
 */
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
/**
 * @api {get} /review/restaurant/:restaurantId list all review for a restaurant
 * @apiName listAllReviewOfRestaurant
 * @apiDescription list all review for a restaurant
 * @apiGroup Review
 *
 * @apiParam (URL Parameter) {Number} restaurantId Restaurant unique ID.
 *
 * @apiSuccessExample {json} Success response:
 * [
 *  {
 *      "id": 1,
 *      "title": "1jsdklfjs",
 *      "contents": "<p>some sontent</p>",
 *      "category": -1,
 *      "restaurantId": 1,
 *      "owner": null,
 *      "createdAt": "2023-04-25T23:39:08.000Z",
 *      "updatedAt": "2023-04-25T23:39:08.000Z",
 *      "Images.id": null
 *  },
 * ]
 * 
 * @apiError (errorGroup) 500 Internal Server Error: request failed due to server error.
 */
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
/**
 * @api {get} /review/user list all review for an user
 * @apiName listAllReviewOfUser
 * @apiDescription list all review for an user
 * @apiGroup Review
 *
 * @apiSuccessExample {json} Success response:
 * [
 *  {
 *      "id": 1,
 *      "title": "1jsdklfjs",
 *      "contents": "<p>some sontent</p>",
 *      "category": -1,
 *      "restaurantId": 1,
 *      "owner": 1,
 *      "createdAt": "2023-04-25T23:39:08.000Z",
 *      "updatedAt": "2023-04-25T23:39:08.000Z",
 *      "Images.id": null
 *  },
 * ]
 * 
 * @apiError (errorGroup) 500 Internal Server Error: request failed due to server error.
 */
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
/**
 * @api {get} /review/:id list review given unique review id
 * @apiName getReview
 * @apiDescription get a review given review's unique id
 * @apiGroup Review
 *
 * @apiParam (url parameter) {Number} review id
 *
 * @apiSuccessExample {json} Success response:
 * {
 *      "id": 3,
 *      "title": "fwfwf",
 *      "contents": "<p>some sontent fwfew</p>",
 *      "category": 1,
 *      "restaurantId": 1,
 *      "owner": 1
 * }
 * 
 * @apiError (errorGroup) 500 Internal Server Error: request failed due to server error.
 */
app.get('/:id', (req, res) => {
    reviewModel.findById(req.params.id, {
        raw: true,
        include: [
            commentModel,
            {
                model: restaurantModel,
                attributes: ['name'],
            },
        ],
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
