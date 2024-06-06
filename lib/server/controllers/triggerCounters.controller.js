const { dtoValidator } = require('../utilities');
const { DtoFactory } = require('../../domain/dtos/DtoFactory');
const Joi = require('joi');
const { updateExpressResponseFromNativeError } = require('../express/updateExpressResponseFromNativeError');
const { triggerCountersService } = require('../services/triggerCounters/TriggerCountersService');

// eslint-disable-next-line valid-jsdoc
/**
 * Return all the trigger counters for a given run
 */
const getAllTriggerCountersForRunHandler = async (request, response) => {
    const requestDto = await dtoValidator(DtoFactory.paramsOnly({
        runNumber: Joi.number().required(),
    }), request, response);

    if (requestDto) {
        try {
            const data = await triggerCountersService.getPerRun(requestDto.params.runNumber);
            response.status(200).json({ data });
        } catch (error) {
            updateExpressResponseFromNativeError(response, error);
        }
    }
};

module.exports = {
    getAllTriggerCountersForRunHandler,
};
