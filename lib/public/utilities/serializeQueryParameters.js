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
 * Given a value and a query param prefix, returns a list of key => values representing the corresponding query parameters (null or undefined
 * values are dropped)
 *
 * for example [1, 3] with prefix 'myPrefix' will result in [{key: 'myPrefix[]', value: 1}, {key: 'myPrefix[]', value: 3]
 * for example {foo: 1, bar: 3} with prefix 'myPrefix' will result in [{key: 'myPrefix[foo]', value: 1}, {key: 'myPrefix[bar]', value: 3]
 *
 * @param {string|boolean|number|null|array|object} parameters the parameter to convert to query param
 * @param {string} key the query parameter's key
 * @return {({key: string, value: (string|number)}|null)[]} the query parameters definition
 */
export const serializeQueryParameters = (parameters, key) => {
    if (parameters === null || parameters === undefined) {
        return [null];
    }

    if (Array.isArray(parameters)) {
        return parameters.map((parameter) => serializeQueryParameters(parameter, `${key}[]`)).flat();
    }

    switch (typeof parameters) {
        case 'boolean':
            return [{ key, value: parameters ? 'true' : 'false' }];
        case 'number':
        case 'string':
            return [{ key, value: parameters }];
        case 'object':
            return Object.entries(parameters)
                .map(([parameterKey, parameter]) => serializeQueryParameters(parameter, `${key}[${parameterKey}]`))
                .flat();
        default:
            return [null];
    }
};

/**
 * Generate a {URLSearchParams} from an object representing the query parameters
 *
 * Parameters can be nested ({foo: {bar: 23}}) and values can be an array ({foo: ['bar', 'baz']})
 *
 * @param {Object} parameters the query parameters
 * @return {URLSearchParams} the generated search params
 */
export const generateURLSearchParams = (parameters) => {
    const ret = new URLSearchParams();

    for (const mainKey in parameters) {
        const serializedQueryParameters = serializeQueryParameters(parameters[mainKey], mainKey);
        for (const serializedQueryParameter of serializedQueryParameters) {
            if (serializedQueryParameter) {
                ret.append(serializedQueryParameter.key, serializedQueryParameter.value);
            }
        }
    }
    return ret;
};
