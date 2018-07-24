module.exports = (sequelize, modelNames) => {
    let restaurantModel = sequelize.model(modelNames.restaurant);
    let regionModel = sequelize.model(modelNames.region);

    regionModel.hasMany(restaurantModel, {foreignKey: 'regionId'});
};