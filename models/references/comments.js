module.exports = (sequelize, modelNames) => {
    let commentModel = sequelize.model(modelNames.comment);
    let userModel = sequelize.model(modelNames.user);
    let reviewModel = sequelize.model(modelNames.review);

    commentModel.belongsTo(reviewModel, {foreignKey: 'reviewId'});
    commentModel.belongsTo(userModel, {foreignKey: 'owner'});
};