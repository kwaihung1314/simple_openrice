const app = require('express').Router();
const sequelize = require('../models');
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
