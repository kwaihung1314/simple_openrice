const DataTypes = require('sequelize').DataTypes;

module.exports = (sequelize, modelName) => {
    let Image = sequelize.define(modelName, {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        restaurantId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        reviewId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        owner: {
            type: DataTypes.INTEGER,
            allowNull: true, 
        },
    });

    return Image;
};