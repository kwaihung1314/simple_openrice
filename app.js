const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

require('./models')(() => {
  const restaurantRouter = require('./routes/restaurants');
  const userRouter = require('./routes/user');
  const reviewRouter = require('./routes/review');
  const regionRouter = require('./routes/regions');
  const imageRouter = require('./routes/images');
  const staticRouter = require('./routes/static');

  app.use('/restaurants', restaurantRouter);
  app.use('/users', userRouter);
  app.use('/review', reviewRouter);
  app.use('/region', regionRouter);
  app.use('/image', imageRouter);
  app.use('/file', staticRouter);

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });
});

module.exports = app;
