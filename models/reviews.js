const DataTypes = require('sequelize').DataTypes;

module.exports = (sequelize, modelName) => {
    let Review = sequelize.define(modelName, {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        contents: {
            type: DataTypes.TEXT('medium'),
            allowNull: false,
        },
        category: {
            // '-1' is bad, '0' is ok, '1' is good
            type: DataTypes.INTEGER,
        },
        restaurantId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        owner: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    });

    return Review;
};