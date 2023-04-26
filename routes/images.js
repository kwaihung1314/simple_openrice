const app = require('express').Router();
const config = require('../config');
const fs = require('fs');
const {promisify} = require('util');
const unlinkAsync = promisify(fs.unlink);
const renameAsync = promisify(fs.rename);
const imageModel = sequelize.model(config.modelNames.image);

const hasha = require('hasha');
const multer = require('multer');
const upload = multer({
    dest: 'public/images',
});
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];

// upload an image
// TODO: add owner

/**
 * @api {post} /image
 * @apiName createImage
 * @apiDescription post a new image
 * @apiGroup Image
 *
 * @apiParam (Request body) {File} file File to upload using HTML forms.
 * @apiSuccessExample {json} Success response:
 * {
 *      "id": "9a3efb551a0f96665da886b1280c2567"
 * }
 *
 * @apiError (errorGroup) 415 Unsupported Media Type.
 * @apiError (errorGroup) 500 Internal Server Error: operation failed due to server error.
 */
app.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    res.sendStatus(400);
    return;
  }
  // check file type
  if (!allowedImageTypes.includes(req.file.mimetype)) {
    unlinkAsync(req.file.path)
    .then(() => {
      res.sendStatus(415);
    })
    .catch((err) => {
      console.log(err);
    });
    return;
  }
  hasha.fromFile(req.file.path, {algorithm: 'md5'})
  .then((hash) => {
    // check if there exist the same file
    return imageModel.findById(hash)
    .then((img) => {
      if (!img) {
        renameAsync(req.file.path, req.file.destination + '/' + hash);
      } else {
        unlinkAsync(req.file.path);
      }
      return imageModel.upsert({
        id: hash,
        name: req.file.originalname,
      }).then(() => {
        res.send({
          id: hash,
        });
      });
    });
  })
  .catch((err) => {
    console.log(err);
    res.sendStatus(500);
  });
});

// get all images of a restaurant, given a restaurant unique id
// get all images of a review, given a review unique id
// ordered by updatedAt
// offset[0], limit[50]

/**
 * @api {get} /image list all images with given criteria
 * @apiName listAllImage
 * @apiDescription list all images given the criteria
 * @apiGroup Image
 *
 * @apiParam (Query String) {String} restaurantId restaurant id to search for a restaurant's image.
 * @apiParam (Query String) {String} reviewId review id to search for a review's image.
 * @apiParam (Query String) {Number} [limit=50] limit.
 * @apiParam (Query String) {Number} [offset=0] number of row to skip.
 *
 * @apiSuccessExample {json} Success response:
 * [
 *  {
 *      id: 100,
 *      name: 'abc restaurant',
 *      regionName: 'Mongkok',
 *      goodFace: 10,
 *      badFace: 1
 *  },
 * ]
 */

app.get('/', (req, res) => {
  let whereCondition = {};
  if (req.query.restaurantId) {
    Object.assign(whereCondition, {
      restaurantId: req.query.restaurantId,
    });
  }
  if (req.query.reviewId) {
    Object.assign(whereCondition, {
      reviewId: req.query.reviewId,
    });
  }
  imageModel.findAll({
    where: whereCondition,
    order: [['updatedAt', 'DESC']],
    offset: req.query.offset || 0,
    limit: req.query.limit || 50,
  })
  .then((images) => {
    res.send(images);
  })
  .catch((err) => {
    console.log(err);
    res.sendStatus(500);
  });
});

module.exports = app;
