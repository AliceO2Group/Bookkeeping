/**
 * @license
 * Copyright CERN and copyright holders of ALICE O2. This software is
 * distributed under the terms of the GNU General Public License v3 (GPL
 * Version 3), copied verbatim in the file "COPYING".
 *
 * See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

const { QueryBuilder: BaseQueryBuilder } = require('./QueryBuilder');
const TransactionHelper = require('./TransactionHelper');

module.exports = (sequelize) => {
    /**
     * For compatibility, provide a class to instantiate from here
     * @deprecated use createQueryBuilder instead
     */
    class QueryBuilder extends BaseQueryBuilder {
        /**
         * Constructor
         */
        constructor() {
            super(sequelize);
        }
    }

    return {
        QueryBuilder,
        TransactionHelper: TransactionHelper(sequelize),
    };
};
