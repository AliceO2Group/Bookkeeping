const Sequelize = require('sequelize');

module.exports = (sequelize) => {
    const TriggerCounters = sequelize.define('TriggerCounters', {
        id: {
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            type: Sequelize.INTEGER,
        },
        timestamp: {
            allowNull: false,
            type: Sequelize.DATE,
        },
        runNumber: {
            allowNull: false,
            type: Sequelize.INTEGER,
        },
        className: {
            allowNull: false,
            type: Sequelize.STRING,
        },
        // LM Before
        lmb: {
            allowNull: false,
            type: Sequelize.BIGINT,
            unsigned: true,
        },
        // LM After
        lma: {
            allowNull: false,
            type: Sequelize.BIGINT,
            unsigned: true,
        },
        l0b: {
            allowNull: false,
            type: Sequelize.BIGINT,
            unsigned: true,
        },
        l0a: {
            allowNull: false,
            type: Sequelize.BIGINT,
            unsigned: true,
        },
        l1b: {
            allowNull: false,
            type: Sequelize.BIGINT,
            unsigned: true,
        },
        l1a: {
            allowNull: false,
            type: Sequelize.BIGINT,
            unsigned: true,
        },
    }, { indexes: [{ unique: true, fields: ['runNumber', 'className'] }] });

    TriggerCounters.associate = (models) => {
        TriggerCounters.belongsTo(models.Run, { as: 'run', targetKey: 'runNumber', foreignKey: 'runNumber' });
    };

    return TriggerCounters;
};
