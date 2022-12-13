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

import { ComparisonOperatorFilterModel } from './ComparisonOperatorFilterModel.js';
import { mergeDuration } from '../../../../utilities/durationUtils.js';

/**
 * Model representing duration filter
 */
export class DurationFilterModel extends ComparisonOperatorFilterModel {
    /**
     * Constructor
     */
    constructor() {
        super();
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     * @override
     */
    parseLimit(rawLimit) {
        if (typeof rawLimit !== 'object') {
            throw Error('Unable to handle non object limit');
        }
        const { hours, minutes, seconds } = rawLimit;

        let ret = {
            ...this.limit,
        };

        for (const [key, rawValue] of Object.entries({ hours, minutes, seconds })) {
            if (rawValue !== undefined) {
                let value = null;
                if (rawValue !== '') {
                    value = parseInt(rawValue, 10);
                    if (isNaN(value)) {
                        throw new Error(`Invalid ${key} : ${rawValue}`);
                    }
                }
                ret[key] = value;
            }
        }

        if (ret.hours === null && ret.minutes === null && ret.seconds === null) {
            ret = null;
        }

        return ret;
    }

    /**
     * Returns the filter's duration in milliseconds
     *
     * @return {number} the normalized representation
     */
    get normalized() {
        return this.limit ? mergeDuration(this.limit) : null;
    }
}
