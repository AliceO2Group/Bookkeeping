/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

const { ShiftTypes } = require('./../../../domain/enums/ShiftTypes.js');

const SHIFT_TAGS_FILTERS = {
    [ShiftTypes.ECS]: {
        include: ['ECS Shifter'],
        exclude: ['EoS'],
    },
    [ShiftTypes.QC_PDP]: {
        include: ['QC/PDP Shifter'],
        exclude: ['EoS'],
    },
};

/**
 * Returns a list of tags filter to be used for querying entries for the shift
 *
 * @param {string} type the type of EOS report
 * @return {{include: string[], exclude: string[]}} list of tags for that specific report type
 */
exports.getShiftTagsFiltersByType = (type) => SHIFT_TAGS_FILTERS[type] ?? { include: [], exclude: [] };
