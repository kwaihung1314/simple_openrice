module.exports = (sequelize, modelNames) => {
    let restaurantModel = sequelize.model(modelNames.restaurant);
    let imageModel = sequelize.model(modelNames.image);
    let userModel = sequelize.model(modelNames.user);
    let commentModel = sequelize.model(modelNames.comment);
    let reviewModel = sequelize.model(modelNames.review);

    reviewModel.hasMany(commentModel, {foreignKey: 'reviewId'});
    reviewModel.hasMany(imageModel, {foreignKey: 'reviewId'});
    reviewModel.belongsTo(restaurantModel, {foreignKey: 'restaurantId'});
    reviewModel.belongsTo(userModel, {foreignKey: 'owner'});
};