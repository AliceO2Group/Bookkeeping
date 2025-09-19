const { expect, AssertionError } = require('chai');

/**
 * Check if request was succesful
 * 
 * @param {object} response server response
 * @param {number} status  HTTP status
 * @return {void}
 */
const expectSuccessStatus = (response, status) => {
    try {
        expect(response.status).to.be.equal(status);
    } catch (exception) {
        const apiErrors = JSON.stringify(response.body?.errors);
        const detailedMessage = `${exception.message}\nAPI Error: ${apiErrors}`;
        const error = new AssertionError(detailedMessage);
        error.apiErrors = apiErrors;
        throw error;
    }
}


module.exports.expectSuccessStatus = expectSuccessStatus;