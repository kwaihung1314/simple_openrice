module.exports = (sequelize, modelNames) => {
    let commentModel = sequelize.model(modelNames.comment);
    let userModel = sequelize.model(modelNames.user);
    let reviewModel = sequelize.model(modelNames.review);
    let imageModel = sequelize.model(modelNames.image);

    userModel.hasMany(reviewModel, {foreignKey: 'owner'});
    userModel.hasMany(commentModel, {foreignKey: 'owner'});
    userModel.hasMany(imageModel, {foreignKey: 'owner'});
};