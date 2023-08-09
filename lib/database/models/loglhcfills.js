'use strict';
const {
    Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class LogLhcfills extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
        static associate(models) {
            // Define association here
        }
    }
    LogLhcfills.init({
        logId: DataTypes.INTEGER,
        lhcFillNumber: DataTypes.INTEGER,
    }, {
        sequelize,
        modelName: 'LogLhcFills',
    });
    return LogLhcfills;
};
