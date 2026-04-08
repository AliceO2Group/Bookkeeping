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
import { RawTextFilterModel } from './RawTextFilterModel.js';

const TOKENS_DELIMITER = ',';

/**
 * Model which accept string input and treats it as sequence of tokens, which processed in regard to given configuration. @see
 * TextTokensFilterModel#constructor
 */
export class TextTokensFilterModel extends RawTextFilterModel {
    /**
     * Constructor
     */
    constructor() {
        super();
    }

    /**
     * Returns the normalized value of the filter, that can be used as URL parameter
     * @return {string[]} the normalized value
     */
    get normalized() {
        return this._value
            .split(TOKENS_DELIMITER)
            .map((token) => token.trim())
            .filter((token) => token.length > 0);
    }

    /**
     * Returns the observable notified any time there is a visual change which has no impact on the actual filter value
     * @return {Observable} the observable
     */
    get visualChange$() {
        return this._visualChange$;
    }
}
