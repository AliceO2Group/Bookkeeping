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
 * Sets the first character of a given string to upper case
 *
 * @param {string} input the input to update
 * @return {string} the result
 */
const ucFirst = (input) => `${input.charAt(0).toUpperCase()}${input.substring(1)}`;

/**
 * Sets the first character of a given string to lower case
 *
 * @param {string} input the input to update
 * @return {string} the result
 */
const lcFirst = (input) => `${input.charAt(0).toLowerCase()}${input.substring(1)}`;

/**
 * Convert a PascalCase string to a snake_case string
 *
 * @param {string} pascal the PascalCase string to convert
 * @return {string} the snake_case result
 */
const pascalToSnake = (pascal) => camelToSnake(lcFirst(pascal));

/**
 * Convert a camelCase string to a snake_case string
 *
 * @param {string} camel the camelCase string to convert
 * @return {string} the snake_case result
 */
const camelToSnake = (camel) => camel.replaceAll(/[A-Z]/g, (match) => `_${match.toLowerCase()}`);

/**
 * Convert a snake_case or SNAKE_CASE string to a camelCase string
 *
 * @param {string} snake the snake_case string to convert
 * @return {string} the camelCase result
 */
const snakeToCamel = (snake) => snake.toLowerCase()
    .replaceAll(/(.)_([a-z])/g, (_, prefix, match) => `${prefix}${match.toUpperCase()}`)
    // Need that the only _ left are the ones in the extremities
    .replace(/^_*([^_]*)_*$/, (_, match) => match);

/**
 * Convert a snake_case or SNAKE_CASE string to a camelCase string
 *
 * @param {string} snake the snake_case string to convert
 * @return {string} the camelCase result
 */
const snakeToPascal = (snake) => ucFirst(snakeToCamel(snake));

exports.ucFirst = ucFirst;

exports.lcFirst = lcFirst;

exports.camelToSnake = camelToSnake;

exports.pascalToSnake = pascalToSnake;

exports.snakeToCamel = snakeToCamel;

exports.snakeToPascal = snakeToPascal;
