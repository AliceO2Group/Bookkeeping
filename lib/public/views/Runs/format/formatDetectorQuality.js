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
import { h, iconBan, switchCase } from '/js/src/index.js';

/**
 * Format detector quality
 * @param {string|null} detectorQuality the quality
 * @return {Component} quality display
 */
export const formatDetectorQuality = (detectorQuality) => h('', {
    class: detectorQuality !== undefined ? `btn white ${switchCase(detectorQuality, {
        good: 'bg-success',
        bad: 'bg-danger',
        null: 'bg-gray',
    }, '')}` : '',
}, detectorQuality === null ? iconBan() : detectorQuality || '');
