const app = require('express').Router();
const fs = require('fs');
const path = require('path');

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

module.exports = app;
