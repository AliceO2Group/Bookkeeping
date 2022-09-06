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

import { amountFilter } from '../common/filters/amountFilter.js';

/**
 * Returns the run duration filter component
 *
 * @param {RunModel} runModel the runs model object
 *
 * @return {vnode} the duration filter
 */
export const durationFilter = (runModel) => amountFilter(
    runModel.runDurationFilter,
    (filter) => {
        runModel.runDurationFilter = filter;
    },
    {
        operatorAttributes: {
            id: 'duration-operator',
        },
        limitAttributes: {
            id: 'duration-limit',
        },
    },
);
