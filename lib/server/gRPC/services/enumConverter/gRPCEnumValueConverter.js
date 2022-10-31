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

const { pascalToSnake } = require('../../../../utilities/stringUtils.js');
const { enumSpecificSupplementarySteps } = require('./enumSpecificSupplementarySteps.js');

/**
 * Convert the given js value to the corresponding value of the given enum
 *
 * @param {string} enumName the name of the gRPC enum
 * @param {string|null|undefined} value the js value to convert to gRPC enum value
 * @return {string|null} the gRPC enum value
 */
const toGRPCEnum = (enumName, value) => {
    if (value === undefined) {
        return undefined;
    }

    if (value === null) {
        value = 'NULL';
    }

    // Value is repeated
    if (Array.isArray(value)) {
        return value.map((item) => toGRPCEnum(enumName, item));
    }

    const supplementaryStep = enumSpecificSupplementarySteps.get(enumName);
    if (supplementaryStep) {
        value = supplementaryStep.toEnum(value);
    }

    return `${pascalToSnake(enumName).toUpperCase()}_${value.toUpperCase()}`;
};

/**
 * Convert the given enum value to the corresponding js value
 *
 * @param {string} enumName the name of the gRPC enum
 * @param {string|undefined} enumValue the gRPC enum value
 * @return {string|undefined|null} the js value
 */
const fromGRPCEnum = (enumName, enumValue) => {
    // Value is optional and not provided
    if (!enumValue) {
        return undefined;
    }

    // Value is repeated
    if (Array.isArray(enumValue)) {
        return enumValue.map((item) => fromGRPCEnum(enumName, item));
    }

    if (!enumValue.startsWith(pascalToSnake(enumName).toUpperCase())) {
        throw new Error(`Invalid enum value ${enumValue} for enum ${enumName}`);
    }

    let value = enumValue.substring(pascalToSnake(enumName).length + 1);

    if (value === 'NULL') {
        return null;
    }

    const supplementaryStep = enumSpecificSupplementarySteps.get(enumName);
    if (supplementaryStep) {
        value = supplementaryStep.fromEnum(value);
    }

    return value;
};

exports.toGRPCEnum = toGRPCEnum;

exports.fromGRPCEnum = fromGRPCEnum;
