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
 * @param {Run} run the run for which detectors must be formatted
 * @return {Component} the formatted run detectors inline
 */
export const formatRunDetectorsInline = (run) => {
    const detectors = run.detectorsQualities;
    if (detectors && detectors.length > 0) {
        return [
            h('.badge.bg-gray-light.mh2.nDetectors-badge', run.nDetectors), detectors.map((detector, index) => {
                const isGoodQuality = detector.quality === RunDetectorQualities.GOOD;
                const lineColor = isGoodQuality ? 'green' : 'red';
                const lineStyle = isGoodQuality ? 'solid' : 'dashed';

                return h('span', {}, [
                    h('span', { style: { borderBottom: `4px ${lineStyle} ${lineColor}` } }, detector.name),
                    index < detectors.length - 1 ? ', ' : '',
                ]);
            }),
        ];
    }
    return '-';
};
