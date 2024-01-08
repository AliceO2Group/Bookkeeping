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

module.exports = (sequelize) => {
    /**
     * Sequelize implementation of the TransactionHelper.
     */
    class TransactionHelper {
        /**
         * Provides a transaction. This will handle committing or rolling back the transaction automatically.
         *
         * @param {Function} callback Callback for the transaction.
         * @param {Object} [options] eventual options to the transaction
         * @param {Object} [options.transaction] an eventual already existing transaction
         * @returns {Promise} Return of the callback
         */
        static async provide(callback, options) {
            if (options?.transaction) {
                return Promise.resolve(callback(options.transaction));
            }
            return sequelize.transaction(options, callback);
        }
    }

    return TransactionHelper;
};
