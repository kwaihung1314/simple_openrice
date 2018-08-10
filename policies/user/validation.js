const Joi = require('joi');

module.exports = (req, res, next) => {
    const schema = Joi.object({
        username: Joi.string().alphanum().min(3).max(12),
        email: Joi.string().email().required(),
        // password must contain both numberic and alphabet value in at least 8 unit length
        password: Joi.string().regex(/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.{8,})/),
    });

    schema.validate(req.body, (err, value) => {
        if (err) {
            res.status(400).send('registration information invalid.');
        }
        next();
    });
};
