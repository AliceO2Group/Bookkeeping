'use strict';

module.exports = {
    up: (queryInterface, _Sequelize) => queryInterface.bulkInsert('users', [
        {
            id: 1,
            external_id: 123,
        },
    ]),

    down: (queryInterface, _Sequelize) => queryInterface.bulkDelete('users', null, {}),
};
