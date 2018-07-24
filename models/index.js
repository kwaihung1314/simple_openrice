const config = require('../config');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(
    config.mysql.database,
    config.mysql.user,
    config.mysql.password,
    {
        host: config.mysql.host,
        dialect: 'mysql',
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        logging: process.env.NODE_ENV === 'production' ? false : console.log,
    },
);

//define models
require('./restaurants')(sequelize, config.modelNames.restaurant);
require('./regions')(sequelize, config.modelNames.region);
require('./reviews')(sequelize, config.modelNames.review);
require('./images')(sequelize, config.modelNames.image);
require('./comments')(sequelize, config.modelNames.comment);
require('./users')(sequelize, config.modelNames.user);

//references
require('./references/restaurants')(sequelize, config.modelNames);
require('./references/regions')(sequelize, config.modelNames);
require('./references/reviews')(sequelize, config.modelNames);
require('./references/images')(sequelize, config.modelNames);
require('./references/comments')(sequelize, config.modelNames);
require('./references/users')(sequelize, config.modelNames);

sequelize.sync()
  .then(() => {
    console.log('Sync');
  })
  .catch((err) => {
    console.log('err connecting the database', err);
  });

module.exports = sequelize;