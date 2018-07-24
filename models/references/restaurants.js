module.exports = (sequelize, modelNames) => {
    let restaurantModel = sequelize.model(modelNames.restaurant);
    let regionModel = sequelize.model(modelNames.region);
    let imageModel = sequelize.model(modelNames.image);
    let reviewModel = sequelize.model(modelNames.review);

    restaurantModel.hasMany(imageModel, {foreignKey: 'restaurantId'});
    restaurantModel.hasMany(reviewModel, {foreignKey: 'restaurantId'});
    restaurantModel.belongsTo(regionModel, {foreignKey: 'regionId'});
    restaurantModel.belongsTo(imageModel, {foreignKey: 'profilePic', constraints: false});
};