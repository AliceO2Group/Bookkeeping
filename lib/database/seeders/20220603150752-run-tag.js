'use strict';

module.exports = {
    up: async ({ context: { queryInterface } }) => await queryInterface.bulkInsert('run_tags', [
        {
            run_id: 106,
            tag_id: 1,
        },
        {
            run_id: 106,
            tag_id: 2,
        },
        {
            run_id: 106,
            tag_id: 3,
        },
        {
            run_id: 106,
            tag_id: 4,
        },
        {
            run_id: 106,
            tag_id: 5,
        },
        {
            run_id: 106,
            tag_id: 6,
        },
        {
            run_id: 106,
            tag_id: 8,
        },
        {
            run_id: 2,
            tag_id: 50,
        },
    ]),

    down: async ({ context: { queryInterface } }) => queryInterface.bulkDelete('run_tags', null, {}),
};
