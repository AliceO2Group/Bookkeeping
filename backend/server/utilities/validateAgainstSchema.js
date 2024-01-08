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

const { BadParameterError } = require('../errors/BadParameterError');

/**
 * Validate data against a given schema
 *
 * @param {{validateAsync}} schema the schema to validate data against
 * @param {*} data the data to validate
 * @return {Promise} resolve with void if the validation is successful, else reject with a BadParameterError
 */
exports.validateAgainstSchema = async (schema, data) => {
    try {
        await schema.validateAsync(data, { abortEarly: false });
    } catch (error) {
        throw new BadParameterError(error.details.map(({ message }) => message).join(', '));
    }
};
