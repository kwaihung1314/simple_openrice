const DataTypes = require('sequelize').DataTypes;

module.exports = (sequelize, modelName) => {
    let Restaurant = sequelize.define(modelName, {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        regionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        profilePic: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    });

    return Restaurant;
};