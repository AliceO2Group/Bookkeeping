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
 * Format a list of detectors inline
 *
 * @return {Component} the formatted run detectors inline
 * @param {RunDetectorQuality[]} detectorsQualities The run detector quality per detector
 * @param {number} nDetectors The number of run detectors
 */
export const formatRunDetectorsInline = (detectorsQualities, nDetectors) => {
    if (detectorsQualities && detectorsQualities.length > 0) {
        return [
            h('.badge.bg-gray-light.mh2.nDetectors-badge', nDetectors), detectorsQualities.map((detector, index) => {
                const isGoodQuality = detector.quality === RunDetectorQualities.GOOD;
                const lineClass = isGoodQuality ? 'b-underline-good' : 'b-underline-bad';

                return h('span', [
                    h(`span.${lineClass}`, detector.name),
                    index < detectorsQualities.length - 1 ? ', ' : '',
                ]);
            }),
        ];
    }
    return '-';
};
