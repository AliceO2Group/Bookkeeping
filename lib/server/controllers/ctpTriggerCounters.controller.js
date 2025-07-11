const { dtoValidator } = require('../utilities');
const { DtoFactory } = require('../../domain/dtos/DtoFactory');
const Joi = require('joi');
const { updateExpressResponseFromNativeError } = require('../express/updateExpressResponseFromNativeError');
const { ctpTriggerCountersService } = require('../services/ctpTriggerCounters/CtpTriggerCountersService');

// eslint-disable-next-line jsdoc/require-param
/**
 * Return all the trigger counters for a given run
 */
const getAllCtpTriggerCountersForRunHandler = async (request, response) => {
    const requestDto = await dtoValidator(DtoFactory.paramsOnly({
        runNumber: Joi.number().required(),
    }), request, response);

    if (requestDto) {
        try {
            const data = await ctpTriggerCountersService.getPerRun(requestDto.params.runNumber);
            response.status(200).json({ data });
        } catch (error) {
            updateExpressResponseFromNativeError(response, error);
        }
    }
};

module.exports = {
    getAllCtpTriggerCountersForRunHandler,
};
