module.exports = (sequelize, modelNames) => {
    let restaurantModel = sequelize.model(modelNames.restaurant);
    let userModel = sequelize.model(modelNames.user);
    let imageModel = sequelize.model(modelNames.image);
    let reviewModel = sequelize.model(modelNames.review);

    imageModel.belongsTo(restaurantModel, {foreignKey: 'restaurantId'});
    imageModel.belongsTo(reviewModel, {foreignKey: 'reviewId'});
    imageModel.belongsTo(userModel, {foreignKey: 'owner'});
    imageModel.hasOne(restaurantModel, {foreignKey: 'profilePic', constraints: false});
};