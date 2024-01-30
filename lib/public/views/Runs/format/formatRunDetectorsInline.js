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

import { h } from '/js/src/index.js';
import { RunDetectorQualities } from '../../../domain/enums/RunDetectorQualities.js';

/**
 * Format a list of detectors inline and underline them based on their quality
 *
 * @param {RunDetectorQuality[]} detectorsQualities The run detector quality per detector
 * @param {number} nDetectors The number of run detectors
 * @return {Component} the formatted run detectors inline
 */
export const formatRunDetectorsInline = (detectorsQualities, nDetectors) => {
    if (detectorsQualities?.length <= 0) {
        return '-';
    }

    return [
        h('.badge.bg-gray-light.mh2.nDetectors-badge', nDetectors),
        detectorsQualities.flatMap((detector, index) => {
            const detectorClass = detectorStyleClass(detector);

            return [
                h(`span.${detectorClass}`, detector.name),
                h('span', index < detectorsQualities.length - 1 ? ',' : ''),
            ];
        }),
    ];
};

/**
 * Gets the class for the style of the detector
 *
 * @param {RunDetectorQuality} detectorsQuality The detector with its quality
 * @return {string} The class of the detecor
 */
const detectorStyleClass = (detectorsQuality) => 'd-inline-block bb3'
    + ` ${detectorsQuality.quality === RunDetectorQualities.GOOD ? 'b-good' : 'b-bad'}`;
