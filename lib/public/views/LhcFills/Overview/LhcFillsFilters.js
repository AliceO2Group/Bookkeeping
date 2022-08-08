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
import { CommaSeparatedValuesFilterModel } from '../../../components/Filters/common/filters/CommaSeparatedValuesFilterModel.js';
import { DateTimeLimitsFilterModel } from '../../../components/Filters/common/filters/DateTimeLimitsFilterModel.js';
import { DurationFilterModel } from '../../../components/Filters/common/filters/DurationFilterModel.js';

/**
 * Model for LHC fills fillters
 */
export class LhcFillsFilters {
    /**
     * Constructor
     */
    constructor() {
        /**
         * @type {DurationFilterModel}
         * @private
         */
        this.duration = new DurationFilterModel();

        /**
         * @type {CommaSeparatedValuesFilterModel}
         * @private
         */
        this.fillingSchemeNames = new CommaSeparatedValuesFilterModel();

        /**
         * @type {DateTimeLimitsFilterModel}
         * @private
         */
        this.stableBeamStart = new DateTimeLimitsFilterModel();

        /**
         * @type {DateTimeLimitsFilterModel}
         * @private
         */
        this.stableBeamEnd = new DateTimeLimitsFilterModel();

        /**
         * @type {CommaSeparatedValuesFilterModel}
         * @private
         */
        this.runNumbers = new CommaSeparatedValuesFilterModel();
    }
}
