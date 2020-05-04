const { ITransactionHelper } = require('../../application/interfaces/database/utilities');
const { isPromise } = require('../../utilities');

module.exports = (sequelize) => {
    /**
     * Sequelize implementation of the TransactionHelper interface.
     */
    class TransactionHelper extends ITransactionHelper {
        /**
         * Provides a transaction. This will handle committing or rolling back the transaction automatically.
         *
         * @param {Function} cb Callback for the transaction.
         * @returns {Promise} Promise object represents ...
         */
        static async provide(cb) {
            return await sequelize.transaction(async () => isPromise(cb) ? await cb() : cb());
        }
    }

    return TransactionHelper;
};
