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
 * @typedef {string|number|null|boolean} QueryParameterValue
 */

/**
 * Build a URL from a base URL (that may already have query parameters) and a list of query parameters
 *
 * @param {string} baseURL the base URL to which parameters should be added
 * @param {object} parameters the query parameters
 * @return {string} URL the built URL
 */
exports.buildUrl = (baseURL, parameters) => {
    if (!parameters) {
        parameters = {};
    }
    const [url, existingParameters] = baseURL.split('?');

    /**
     * Build a parameter object or array from a parameters keys path
     *
     * For example, a parameter `key1[key2][]=value` translates to keys path ['key1', 'key2', ''] and will lead to {key1: {key2: [value]}}
     *
     * @param {object|array} parentParameter the parameter's object or array up to the current key
     * @param {array} nestedKeys the keys path to build from the current point
     * @param {string} value the value of the parameter represented by the key path
     * @param {string|null} absoluteCurrentKey the full key currently building, used to display useful error message
     * @return {void}
     */
    const buildParameterFromNestedKeys = (parentParameter, nestedKeys, value, absoluteCurrentKey) => {
        const currentKey = nestedKeys.shift();
        const absoluteParentKey = absoluteCurrentKey;
        absoluteCurrentKey = absoluteCurrentKey ? `${absoluteCurrentKey}[${currentKey}]` : currentKey;

        if (currentKey === '') {
            // Parameter must be an array and the value is a new item in that array
            if (!Array.isArray(parentParameter)) {
                throw new Error(`Existing parameter at key <${absoluteParentKey}> is an array`);
            }

            parentParameter.push(value);
        } else if (currentKey) {
            // Parameter must be an object and the value is a property in that array
            if (Array.isArray(parentParameter) || typeof parentParameter !== 'object' || parentParameter === null) {
                throw new Error(`Existing parameter at key <${absoluteParentKey}> expects nested values`);
            }

            if (nestedKeys.length > 0) {
                // We still have nested keys to fill
                if (!(currentKey in parentParameter)) {
                    parentParameter[currentKey] = nestedKeys[0] === '' ? [] : {};
                }
                buildParameterFromNestedKeys(parentParameter[currentKey], nestedKeys, value, absoluteCurrentKey);
            } else {
                if (Array.isArray(parentParameter[currentKey])) {
                    throw new Error(`Existing parameter at key <${currentKey}> is not an array`);
                } else if (typeof parentParameter[currentKey] === 'object' && parentParameter[currentKey] !== null) {
                    throw new Error(`Existing parameter at key <${currentKey}> is not nested`);
                }
                parentParameter[currentKey] = value;
            }
        }
    };

    if (existingParameters) {
        for (const formattedParameter of existingParameters.split('&')) {
            const [key, value] = formattedParameter.split('=');
            const [firstKey, ...dirtyKeys] = key.split('[');
            const nestedKeys = [firstKey, ...dirtyKeys.map((key) => key.slice(0, -1))];

            buildParameterFromNestedKeys(parameters, nestedKeys, value, null);
        }
    }

    const serializedQueryParameters = [];

    if (Object.keys(parameters).length === 0) {
        return url;
    }

    /**
     * Stringify a query parameter to be used in a URL and push it in the serialized query parameters list
     *
     * @param {string} key the parameter's key
     * @param {QueryParameterValue} value the parameter's value
     * @return {void}
     */
    const formatAndPushQueryParameter = (key, value) => {
        if (value === undefined) {
            return;
        }

        if (Array.isArray(value)) {
            for (const subValue of value) {
                formatAndPushQueryParameter(`${key}[]`, subValue);
            }
            return;
        }

        if (typeof value === 'object' && value !== null) {
            for (const [subKey, subValue] of Object.entries(value)) {
                formatAndPushQueryParameter(`${key}[${subKey}]`, subValue);
            }
            return;
        }

        serializedQueryParameters.push(`${key}=${value}`);
    };

    for (const [key, parameter] of Object.entries(parameters)) {
        formatAndPushQueryParameter(key, parameter);
    }

    return `${url}?${serializedQueryParameters.join('&')}`;
};
