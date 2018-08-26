const DataTypes = require('sequelize').DataTypes;

module.exports = (sequelize, modelName) => {
    const Region = sequelize.define(modelName, {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });

    return Region;
};

// add all regions
