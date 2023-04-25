const config = require('../config');
const Sequelize = require('sequelize');
const mysql = require('mysql2/promise');

const { host, port, user, password, database } = config.mysql;

module.exports = (onDbReady) => {
  mysql.createConnection({ host, port, user, password })
  .then((connection) => {
    connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`)
  })
  .then(() => {
    const sequelize = new Sequelize(
      database,
      user,
      password,
      {
          host,
          dialect: 'mysql',
          pool: {
              max: 5,
              min: 0,
              acquire: 30000,
              idle: 10000,
          },
          logging: process.env.NODE_ENV === 'production' ? false : console.log,
      }
    );
    
    // define models
    require('./restaurants')(sequelize, config.modelNames.restaurant);
    require('./regions')(sequelize, config.modelNames.region);
    require('./reviews')(sequelize, config.modelNames.review);
    require('./images')(sequelize, config.modelNames.image);
    require('./comments')(sequelize, config.modelNames.comment);
    require('./users')(sequelize, config.modelNames.user);
    
    // references
    require('./references/restaurants')(sequelize, config.modelNames);
    require('./references/regions')(sequelize, config.modelNames);
    require('./references/reviews')(sequelize, config.modelNames);
    require('./references/images')(sequelize, config.modelNames);
    require('./references/comments')(sequelize, config.modelNames);
    require('./references/users')(sequelize, config.modelNames);
    
    return sequelize
  })
  .then((sequelize) => {
    global['sequelize'] = sequelize;
    return sequelize.sync();
  })
  .then(() => {
    console.log('Sync');
    onDbReady();
  })
  .catch((err) => {
    console.log('err connecting the database', err);
  });
}
