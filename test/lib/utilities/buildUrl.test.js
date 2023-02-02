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

const { expect } = require('chai');
const { buildUrl } = require('../../../lib/utilities/buildUrl.js');

module.exports = () => {
    it('should successfully build URL using only parameters object', () => {
        const [, fullParametersExpressions] = buildUrl('https://example.com', {
            simple: 'hello',
            key: {
                nested: [1, 2],
            },
        }).split('?');

        const parametersExpressions = fullParametersExpressions.split('&');
        expect(parametersExpressions).to.includes('simple=hello');
        expect(parametersExpressions).to.includes('key[nested][]=1');
        expect(parametersExpressions).to.includes('key[nested][]=2');
    });
    it('should successfully build URL by combining existing parameters', () => {
        const [, fullParametersExpressions] = buildUrl('https://example.com?simple=hello&key1[key2][]=13&key1[key2][]=35', {
            key1: {
                key2: [1, 2],
            },
            key3: null,
        }).split('?');

        const parametersExpressions = fullParametersExpressions.split('&');
        expect(parametersExpressions).to.includes('simple=hello');
        expect(parametersExpressions).to.includes('key1[key2][]=13');
        expect(parametersExpressions).to.includes('key1[key2][]=35');
        expect(parametersExpressions).to.includes('key1[key2][]=1');
        expect(parametersExpressions).to.includes('key1[key2][]=2');
        expect(parametersExpressions).to.includes('key3=null');
    });
    it('should throw an error when trying to push value to not array parameter', () => {
        expect(() => {
            buildUrl(
                'https://example.com?key=12',
                {
                    key: [1, 3],
                },
            );
        }).to.throw('Existing parameter at key <key> is not an array');

        expect(() => {
            buildUrl(
                'https://example.com?key[nested]=12',
                {
                    key: [1, 3],
                },
            );
        }).to.throw('Existing parameter at key <key> expects nested values');
    });
    it('should throw an error when trying to set nested value of a not nested parameter', () => {
        expect(() => {
            buildUrl(
                'https://example.com?key=12',
                {
                    key: { nested: 13 },
                },
            );
        }).to.throw('Existing parameter at key <key> is not nested');

        expect(() => {
            buildUrl(
                'https://example.com?key[]=12',
                {
                    key: { nested: 13 },
                },
            );
        }).to.throw('Existing parameter at key <key> is an array');
    });
    it('should throw an error when trying to set value for array parameter', () => {
        expect(() => {
            buildUrl(
                'https://example.com?key[]=12',
                {
                    key: 1,
                },
            );
        }).to.throw('Existing parameter at key <key> is an array');
    });
    it('should throw an error when trying to set value for nested parameter', () => {
        expect(() => {
            buildUrl(
                'https://example.com?key[nested]=12',
                {
                    key: 1,
                },
            );
        }).to.throw('Existing parameter at key <key> expects nested values');
    });
};
