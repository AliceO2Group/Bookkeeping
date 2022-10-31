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

/**
 * Convert a PascalCase string to a snake_case string
 *
 * @param {string} pascal the PascalCase string to convert
 * @return {string} the snake_case result
 */
const pascalToSnake = (pascal) => camelToSnake(`${pascal.charAt(0).toLowerCase()}${pascal.substring(1)}`);

/**
 * Convert a camelCase string to a snake_case string
 *
 * @param {string} camel the camelCase string to convert
 * @return {string} the snake_case result
 */
const camelToSnake = (camel) => camel.replace(/([A-Z])/, (match) => `_${match.toLowerCase()}`);

exports.camelToSnake = camelToSnake;

exports.pascalToSnake = pascalToSnake;
