const DataTypes = require('sequelize').DataTypes;

module.exports = (sequelize, modelName) => {
    let Comment = sequelize.define(modelName, {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        content: {
            type: DataTypes.TEXT('medium'),
            allowNull: false,
        },
        reviewId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        owner: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    });

    return Comment;
};