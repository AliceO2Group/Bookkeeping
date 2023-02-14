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

import { checkboxFilter } from '../common/filters/checkboxFilter.js';
import { RUN_QUALITIES } from '../../../domain/enums/RunQualities.js';

/**
 * Returns a panel to be used by user to filter runs by quality
 * @param {RunModel} runModel the run model object
 * @return {vnode} A text box that allows the user to enter a title substring to match against all logs
 */
const runQualityFilter = (runModel) => checkboxFilter(
    'runQuality',
    RUN_QUALITIES,
    (runQuality) => runModel.isRunQualityInFilter(runQuality),
    (e, runQuality) => e.target.checked ? runModel.addRunQualityFilter(runQuality) : runModel.removeRunQualityFilter(runQuality),
);

export default runQualityFilter;
