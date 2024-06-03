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

/**
 * Format QC flag creator name
 *
 * @param {QcFlag} qcFlag QC flag of which creator name should be formatted
 * @return {string} name of person/service who created the flag
 */
export const formatQcFlagCreatedBy = ({ origin, createdBy }) => {
    const defaultName = 'Anonymous';
    if (origin && (createdBy?.name ?? defaultName) === defaultName) {
        return origin;
    }
    return createdBy?.name || '-';
};
