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

module.exports = {
    PHYSICS: {
        processingAndITSAndFT0: {
            dcs: true,
            dd_flp: true,
            epn: true,
            triggerValue: 'CTP',
            tfbDdMode: 'processing',
            pdpWorkflowParameters: 'QC,CTF',
            lhcFill: {
                stableBeamsStart: '2022-10-01T10:00:00',
                stableBeamsEnd: '2022-10-02T10:00:00',
            },
            startTime: 1664618400000, // 2022-10-01T12:00:00
            endTime: 1664625600000, // 2022-10-01T14:00:00
            concatenatedDetectors: 'ITS, TST, FT0',
        },
        processingAndFT0AndITS: {
            dcs: true,
            dd_flp: true,
            epn: true,
            triggerValue: 'CTP',
            tfbDdMode: 'processing',
            pdpWorkflowParameters: 'QC,CTF',
            lhcFill: {
                stableBeamsStart: '2022-10-01T10:00:00',
                stableBeamsEnd: '2022-10-02T10:00:00',
            },
            startTime: 1664618400000, // 2022-10-01T12:00:00
            endTime: 1664625600000, // 2022-10-01T14:00:00
            concatenatedDetectors: 'FT0, TST, ITS',
        },
        processingDiskAndITSAndFT0: {
            dcs: true,
            dd_flp: true,
            epn: true,
            triggerValue: 'CTP',
            tfbDdMode: 'processing-disk',
            pdpWorkflowParameters: 'QC,CTF',
            lhcFill: {
                stableBeamsStart: '2022-10-01T10:00:00',
                stableBeamsEnd: '2022-10-02T10:00:00',
            },
            startTime: 1664618400000, // 2022-10-01T12:00:00
            endTime: 1664625600000, // 2022-10-01T14:00:00
            concatenatedDetectors: 'ITS, TST, FT0',
        },
        processingDiskAndFT0AndITS: {
            dcs: true,
            dd_flp: true,
            epn: true,
            triggerValue: 'CTP',
            tfbDdMode: 'processing-disk',
            pdpWorkflowParameters: 'QC,CTF',
            lhcFill: {
                stableBeamsStart: '2022-10-01T10:00:00',
                stableBeamsEnd: '2022-10-02T10:00:00',
            },
            startTime: 1664618400000, // 2022-10-01T12:00:00
            endTime: 1664625600000, // 2022-10-01T14:00:00
            concatenatedDetectors: 'FT0, TST, ITS',
        },
    },
    COSMICS: {
        stableBeamOverlapAndNoDetector: {
            dcs: true,
            dd_flp: true,
            epn: true,
            triggerValue: 'CTP',
            tfbDdMode: 'processing',
            pdpWorkflowParameters: 'QC,CTF',
            lhcFill: {
                stableBeamsStart: '2022-10-01T10:00:00',
                stableBeamsEnd: '2022-10-02T10:00:00',
            },
            startTime: 1664618400000, // 2022-10-01T12:00:00
            endTime: 1664625600000, // 2022-10-01T14:00:00
            concatenatedDetectors: 'TPC, TST',
            runType: {
                name: 'COSMICS',
            },
            beamMode: 'NO BEAM',
        },
        stableBeamOverlapAndNoDetectorAndNoBeam: {
            dcs: true,
            dd_flp: true,
            epn: true,
            triggerValue: 'CTP',
            tfbDdMode: 'processing',
            pdpWorkflowParameters: 'QC,CTF',
            lhcFill: {
                stableBeamsStart: '2022-10-01T10:00:00',
                stableBeamsEnd: '2022-10-02T10:00:00',
            },
            startTime: 1664618400000, // 2022-10-01T12:00:00
            endTime: 1664625600000, // 2022-10-01T14:00:00
            concatenatedDetectors: 'TPC, TST',
            runType: {
                name: 'COSMICS',
            },
        },
    },
    COMMISSIONING: {
        standalone: {
            dcs: true,
            dd_flp: true,
            epn: true,
            triggerValue: 'CTP',
            tfbDdMode: 'processing',
            pdpWorkflowParameters: 'QC,CTF',
            lhcFill: {
                stableBeamsStart: '2022-10-01T10:00:00',
                stableBeamsEnd: '2022-10-02T10:00:00',
            },
            startTime: 1664618400000, // 2022-10-01T12:00:00
            endTime: 1664625600000, // 2022-10-01T14:00:00
            concatenatedDetectors: 'TPC, TST',
            runType: {
                name: 'STANDALONE',
            },
        },
        noStableBeamOverlap: {
            dcs: true,
            dd_flp: true,
            epn: true,
            triggerValue: 'CTP',
            tfbDdMode: 'processing',
            pdpWorkflowParameters: 'QC,CTF',
            lhcFill: {
                stableBeamsStart: '2022-10-03T10:00:00',
                stableBeamsEnd: '2022-10-04T10:00:00',
            },
            startTime: 1664618400000, // 2022-10-01T12:00:00
            endTime: 1664625600000, // 2022-10-01T14:00:00
            concatenatedDetectors: 'ITS, TST',
        },
    },
    TECHNICAL: {
        standalone: {
            dcs: true,
            dd_flp: true,
            epn: true,
            triggerValue: 'CTP',
            tfbDdMode: 'processing',
            pdpWorkflowParameters: 'QC,CTF',
            lhcFill: {
                stableBeamsStart: '2022-10-01T10:00:00',
                stableBeamsEnd: '2022-10-02T10:00:00',
            },
            startTime: 1664618400000, // 2022-10-01T12:00:00
            endTime: 1664625600000, // 2022-10-01T14:00:00
            concatenatedDetectors: 'TPC, TST',
            runType: {
                name: 'TECHNICAL',
            },
            pdpBeamType: 'technical',
        },
    },
    SYNTHETIC: {
        PP: {
            dcs: false,
            dd_flp: true,
            epn: true,
            triggerValue: 'OFF',
            tfbDdMode: 'processing',
            pdpWorkflowParameters: 'QC,CTF',
            readoutCfgUri: 'replay/pp',
            lhcFill: {
                stableBeamsStart: '2022-10-01T10:00:00',
                stableBeamsEnd: '2022-10-02T10:00:00',
            },
            startTime: 1664618400000, // 2022-10-01T12:00:00
            endTime: 1664625600000, // 2022-10-01T14:00:00
            concatenatedDetectors: 'TPC, TST',
            runType: {
                name: 'TECHNICAL',
            },
        },
        PBPB: {
            dcs: false,
            dd_flp: true,
            epn: true,
            triggerValue: 'OFF',
            tfbDdMode: 'processing',
            pdpWorkflowParameters: 'QC,CTF',
            readoutCfgUri: 'replay/pbpb',
            lhcFill: {
                stableBeamsStart: '2022-10-01T10:00:00',
                stableBeamsEnd: '2022-10-02T10:00:00',
            },
            startTime: 1664618400000, // 2022-10-01T12:00:00
            endTime: 1664625600000, // 2022-10-01T14:00:00
            concatenatedDetectors: 'TPC, TST',
            runType: {
                name: 'TECHNICAL',
            },
        },
    },
    CALIBRATION: {
        PEDESTAL: {
            dcs: false,
            dd_flp: true,
            epn: true,
            triggerValue: 'OFF',
            tfbDdMode: 'processing',
            pdpWorkflowParameters: 'QC,CTF',
            readoutCfgUri: 'reply/pbpb',
            lhcFill: {
                stableBeamsStart: '2022-10-01T10:00:00',
                stableBeamsEnd: '2022-10-02T10:00:00',
            },
            startTime: 1664618400000, // 2022-10-01T12:00:00
            endTime: 1664625600000, // 2022-10-01T14:00:00
            concatenatedDetectors: 'TPC, TST',
            runType: {
                name: 'PEDESTAL',
            },
        },
        LASER: {
            dcs: false,
            dd_flp: true,
            epn: true,
            triggerValue: 'OFF',
            tfbDdMode: 'processing',
            pdpWorkflowParameters: 'QC,CTF',
            readoutCfgUri: 'reply/pbpb',
            lhcFill: {
                stableBeamsStart: '2022-10-01T10:00:00',
                stableBeamsEnd: '2022-10-02T10:00:00',
            },
            startTime: 1664618400000, // 2022-10-01T12:00:00
            endTime: 1664625600000, // 2022-10-01T14:00:00
            concatenatedDetectors: 'TPC, TST',
            runType: {
                name: 'LASER',
            },
        },
        PULSER: {
            dcs: false,
            dd_flp: true,
            epn: true,
            triggerValue: 'OFF',
            tfbDdMode: 'processing',
            pdpWorkflowParameters: 'QC,CTF',
            readoutCfgUri: 'reply/pbpb',
            lhcFill: {
                stableBeamsStart: '2022-10-01T10:00:00',
                stableBeamsEnd: '2022-10-02T10:00:00',
            },
            startTime: 1664618400000, // 2022-10-01T12:00:00
            endTime: 1664625600000, // 2022-10-01T14:00:00
            concatenatedDetectors: 'TPC, TST',
            runType: {
                name: 'PULSER',
            },
        },
        NOISE: {
            dcs: false,
            dd_flp: true,
            epn: true,
            triggerValue: 'OFF',
            tfbDdMode: 'processing',
            pdpWorkflowParameters: 'QC,CTF',
            readoutCfgUri: 'reply/pbpb',
            lhcFill: {
                stableBeamsStart: '2022-10-01T10:00:00',
                stableBeamsEnd: '2022-10-02T10:00:00',
            },
            startTime: 1664618400000, // 2022-10-01T12:00:00
            endTime: 1664625600000, // 2022-10-01T14:00:00
            concatenatedDetectors: 'TPC, TST',
            runType: {
                name: 'NOISE',
            },
        },
    },
};
