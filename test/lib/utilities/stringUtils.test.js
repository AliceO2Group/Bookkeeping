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

const { snakeToCamel, pascalToSnake, ucFirst, lcFirst, snakeToPascal } = require('../../../lib/utilities/stringUtils.js');
const { expect } = require('chai');

module.exports = () => {
    it('should succeffully set the first character of a given string to upper case', () => {
        expect(ucFirst('myString')).to.equal('MyString');
        expect(ucFirst('MyString')).to.equal('MyString');
        expect(ucFirst('my string')).to.equal('My string');
        expect(ucFirst('My string')).to.equal('My string');
        expect(ucFirst('my-string')).to.equal('My-string');
        expect(ucFirst('My-string')).to.equal('My-string');
        expect(ucFirst('string')).to.equal('String');
        expect(ucFirst('String')).to.equal('String');
    });

    it('should succeffully set the first character of a given string to lower case', () => {
        expect(lcFirst('myString')).to.equal('myString');
        expect(lcFirst('MyString')).to.equal('myString');
        expect(lcFirst('my string')).to.equal('my string');
        expect(lcFirst('My string')).to.equal('my string');
        expect(lcFirst('my-string')).to.equal('my-string');
        expect(lcFirst('My-string')).to.equal('my-string');
        expect(lcFirst('string')).to.equal('string');
        expect(lcFirst('String')).to.equal('string');
    });

    it('should successfully convert PascalCase string to snake_case string', () => {
        expect(pascalToSnake('ThisIsPascalCase')).to.equal('this_is_pascal_case');
        expect(pascalToSnake('Pascal')).to.equal('pascal');
    });

    it('should successfully convert camelCase string to snake_case string', () => {
        expect(pascalToSnake('thisIsCamelCase')).to.equal('this_is_camel_case');
        expect(pascalToSnake('camel')).to.equal('camel');
    });

    it('should successfully convert snake_case string to camelCase', () => {
        expect(snakeToCamel('this_is_snake_case')).to.equal('thisIsSnakeCase');
        expect(snakeToCamel('_this_is_snake_case')).to.equal('thisIsSnakeCase');
        expect(snakeToCamel('this_is_snake_case_')).to.equal('thisIsSnakeCase');
        expect(snakeToCamel('_this_is_snake_case_')).to.equal('thisIsSnakeCase');
        expect(snakeToCamel('snake')).to.equal('snake');

        expect(snakeToCamel('THIS_IS_SNAKE_CASE')).to.equal('thisIsSnakeCase');
        expect(snakeToCamel('_THIS_IS_SNAKE_CASE')).to.equal('thisIsSnakeCase');
        expect(snakeToCamel('THIS_IS_SNAKE_CASE_')).to.equal('thisIsSnakeCase');
        expect(snakeToCamel('_THIS_IS_SNAKE_CASE_')).to.equal('thisIsSnakeCase');
        expect(snakeToCamel('SNAKE')).to.equal('snake');
    });

    it('should successfully convert snake_case string to PascalCase', () => {
        expect(snakeToPascal('this_is_snake_case')).to.equal('ThisIsSnakeCase');
        expect(snakeToPascal('_this_is_snake_case')).to.equal('ThisIsSnakeCase');
        expect(snakeToPascal('this_is_snake_case_')).to.equal('ThisIsSnakeCase');
        expect(snakeToPascal('_this_is_snake_case_')).to.equal('ThisIsSnakeCase');
        expect(snakeToPascal('snake')).to.equal('Snake');

        expect(snakeToPascal('THIS_IS_SNAKE_CASE')).to.equal('ThisIsSnakeCase');
        expect(snakeToPascal('_THIS_IS_SNAKE_CASE')).to.equal('ThisIsSnakeCase');
        expect(snakeToPascal('THIS_IS_SNAKE_CASE_')).to.equal('ThisIsSnakeCase');
        expect(snakeToPascal('_THIS_IS_SNAKE_CASE_')).to.equal('ThisIsSnakeCase');
        expect(snakeToPascal('SNAKE')).to.equal('Snake');
    });
};
