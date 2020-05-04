/**
 * TransactionHelper
 */
class TransactionHelper {
    /**
     * Provides a transaction. This will handle committing or rolling back the transaction automatically.
     *
     * @param {Function} cb Callback for the transaction.
     * @returns {Promise} Promise object represents ...
     */
    static async provide(cb) {
        return Promise.reject('The method or operation is not implemented.');
    }
}

module.exports = TransactionHelper;
