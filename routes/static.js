const app = require('express').Router();
const fs = require('fs');
const path = require('path');

/**
 * @api {get} /file/:id list image (file) with file id
 * @apiName getFile
 * @apiDescription get file with file id
 * @apiGroup File
 * 
 * @apiError (errorGroup) 404 Not found: File not found for the given file id.
 * @apiError (errorGroup) 500 Internal Server Error: request failed due to server error.
 */
app.get('/:id', (req, res) => {
    let pathString = path.resolve(__dirname, '../public/images', req.params.id);
    let stream = fs.createReadStream(pathString);
    stream.on('error', (err) => {
        if (err.code === 'ENOENT') {
            res.sendStatus(404);
        } else {
            res.sendStatus(500);
        }
        return;
    });
    stream.pipe(res);
});

app.get('/doc', (req, res) => {
    let pathString = path.resolve(__dirname, '../doc', 'index.html');
    console.log(pathString)
    let stream = fs.createReadStream(pathString);
    stream.on('error', (err) => {
        if (err.code === 'ENOENT') {
            res.sendStatus(404);
        } else {
            res.sendStatus(500);
        }
        return;
    });
    stream.pipe(res);
});

module.exports = app;
