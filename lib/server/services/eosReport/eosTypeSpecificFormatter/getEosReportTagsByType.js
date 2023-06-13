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

const { ShiftTypes } = require('../../../../domain/enums/ShiftTypes');

const EOS_REPORT_TAGS = {
    [ShiftTypes.ECS]: ['ECS', 'ECS Shifter', 'CTP', 'FLP', 'EPN', 'EoS'],
    [ShiftTypes.QC_PDP]: ['QC', 'PDP', 'QC/PDP Shifter', 'EoS'],
    [ShiftTypes.SLIMOS]: ['SLIMOS', 'EoS'],
    [ShiftTypes.SL]: ['Shift Leader', 'EoS'],
};

/**
 * Returns a list of tags to be associated with an EOS report entry
 *
 * @param {string} type the type of EOS report
 * @return {Array<string>} list of tags for that specific report type
 */
exports.getEosReportTagsByType = (type) => EOS_REPORT_TAGS[type] ?? [];
