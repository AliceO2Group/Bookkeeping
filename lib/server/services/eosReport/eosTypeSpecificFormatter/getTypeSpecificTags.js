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

/**
 * Returns a list of tags to be associated with a type of EOS report
 *
 * @param {string} type the type of EOS report
 * @return {Array<string>} list of tags for that specific report type
 */
exports.getTagsByReportType = (type) => {
    switch (type) {
        case ShiftTypes.ECS:
            return ['ECS', 'ECS Shifter', 'CTP', 'FLP', 'EPN', 'EoS'];
    }
    return [];
};
