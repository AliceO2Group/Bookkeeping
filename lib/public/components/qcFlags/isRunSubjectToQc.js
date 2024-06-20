/**
 * @license
 * Copyright 2019-2020 CERN and copyright holders of ALICE O2.
 * See http://alice-o2.web.cern.ch/copyright for details of the copyright holders.
 * All rights not expressly granted are reserved.
 *
 * This software is distributed under the terms of the GNU General Public
 * License v3 (GPL Version 3), copied verbatim in the file "COPYING".
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

import { RunQualities } from '../../domain/enums/RunQualities.js';

const QcDisabledReason = {
    BAD_RUN_IN_ASYNC_QC_MESSAGE: `Quality of the run was changed to ${RunQualities.BAD} so it is no more subject to QC`,
    NOT_FOR_PHYSICS_TAG: 'Run was tags as not for physics so it is no more subject to QC',
};

/**
 * Set of names of tags which prevent run to be subject to QC
 */
const RUN_TAGS_DISABLING_QC = new Set(['Not for physics']);

/**
 * States whther run is subject to QC
 *
 * @param {Run} run a run
 * @return {boolean} true if run is NOT subject to QC, false otherwise
 */
export const isRunNotSubjectToQc = ({ runQuality, tags }) => runQuality === RunQualities.BAD
    || tags.find(({ text }) => RUN_TAGS_DISABLING_QC.has(text));

/**
 * Get reason why a run is not subject to QC
 *
 * @param {Run} run a run
 * @return {string} reason
 */
export const getRunNotSubjectToQcReason = ({ runQuality, tags }) => {
    let reason = '';
    if (runQuality === RunQualities.BAD) {
        reason += QcDisabledReason.BAD_RUN_IN_ASYNC_QC_MESSAGE;
    }
    if (tags.find(({ text }) => RUN_TAGS_DISABLING_QC.has(text))) {
        reason += QcDisabledReason.NOT_FOR_PHYSICS_TAG;
    }
    return reason;
};
