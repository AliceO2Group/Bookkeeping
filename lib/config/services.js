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

const {
    MONALISA_CERTIFICATE_PATH,
    MONALISA_CERTIFICATE_PASSPHRASE,
    DATA_PASSES_YEAR_LOWER_LIMIT,
    MONALISA_DATA_PASSES_URL,
    MONALISA_DATA_PASS_DETAILS_URL,
    MONALISA_SIMULATION_PASSES_URL,
    MONALISA_ENABLE_SYNCHRONIZATION,
    MONALISA_SYNCHRONIZATION_PERIOD,
    CCDB_ENABLE_SYNCHRONIZATION,
    CCDB_SYNCHRONIZATION_PERIOD,
    CCDB_RUN_INFO_URL,
} = process.env ?? {};

exports.services = {
    enableHousekeeping: process.env?.ENABLE_HOUSEKEEPING?.toLowerCase() === 'true',
    aliEcsGui: {
        url: process.env?.ALI_ECS_GUI_URL || null,
        token: process.env?.ALI_ECS_GUI_TOKEN || null,
    },
    infologger: {
        flp: {
            url: process.env?.FLP_INFOLOGGER_URL || null,
        },
        epn: {
            url: process.env?.EPN_INFOLOGGER_URL || null,
        },
    },
    qcGui: {
        url: process.env?.QC_GUI_URL || null,
    },
    aliFlpIndex: {
        url: process.env?.ALI_FLP_INDEX_URL || null,
    },

    monalisa: {
        userCertificate: {
            path: MONALISA_CERTIFICATE_PATH,
            passphrase: MONALISA_CERTIFICATE_PASSPHRASE,
        },
        dataPassesYearLowerLimit: Number(DATA_PASSES_YEAR_LOWER_LIMIT) || 2022,

        dataPassesUrl: MONALISA_DATA_PASSES_URL,
        dataPassDetailsUrl: MONALISA_DATA_PASS_DETAILS_URL,

        simulationPassesUrl: MONALISA_SIMULATION_PASSES_URL,

        enableSynchronization: MONALISA_ENABLE_SYNCHRONIZATION?.toLowerCase() === 'true',
        synchronizationPeriod: Number(MONALISA_SYNCHRONIZATION_PERIOD) || 60 * 60 * 1000, //  1h in millisecond
    },

    ccdb: {
        enableSynchronization: CCDB_ENABLE_SYNCHRONIZATION?.toLowerCase() === 'true',
        synchronizationPeriod: Number(CCDB_SYNCHRONIZATION_PERIOD) || 24 * 60 * 60 * 1000, // 1d in milliseconds
        runInfoUrl: CCDB_RUN_INFO_URL,
    },
};
