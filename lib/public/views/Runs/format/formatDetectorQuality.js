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
import { getValueFromCssVar, isContrastBlack } from '../../../components/common/badge.js';
import { h, iconBan } from '/js/src/index.js';

const OnlineGeneralQualityColors = {
    good: '--color-success',
    bad: '--color-danger',
    null: '--color-gray',
};

/**
 * Format detector online quality
 *
 * @param {string|null} detectorQuality the quality
 * @return {Component} quality display
 */
export const formatDetectorQuality = (detectorQuality) => detectorQuality === null
    ? h('m2.badge.gray', iconBan())
    : h(
        '.btn.w-100',
        {
            style: {
                backgroundColor: `var(${OnlineGeneralQualityColors[detectorQuality]})`,
                color: isContrastBlack(getValueFromCssVar(OnlineGeneralQualityColors[detectorQuality])) ? 'black' : 'white',
                cursor: 'default',
            },
        },
        detectorQuality,
    );
