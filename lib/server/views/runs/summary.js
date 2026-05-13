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

export const runSummary = {
    attributes: [
        'id',
        'runNumber', 
        'nDetectors', 
        'lhcBeamMode', 
        'timeO2Start', 
        'timeTrgEnd', 
        'timeTrgStart', 
        'timeO2End', 
        'firstTfTimestamp', 
        'lastTfTimestamp', 
        'triggerValue', 
        'runDuration', 
        'definition', 
        'calibrationStatus',
        'environmentId',
        'runQuality',
        'nEpns',
        'pdpBeamType',
        'nFlps',
        'nSubtimeframes',
        'bytesReadOut',
        'dd_flp',
        'dcs',
        'epn',
        'qcTimeStart',
        'qcTimeEnd',
        'epnTopology',
        'odcTopologyFullName',
        'inelasticInteractionRateAvg',
        'inelasticInteractionRateAtStart',
        'inelasticInteractionRateAtMid',
        'inelasticInteractionRateAtEnd',
        'aliceDipolePolarity',
        'aliceDipoleCurrent',
        'aliceL3Polarity',
        'aliceL3Current',
        'fillNumber'
    ],
    include: [
        { association: 'tags', attributes: ['text', 'id'] },
        { association: 'detectors', attributes: ['name'] },
        { association: 'runType', attributes: ['name'] },
        { association: 'lhcPeriod',attributes: ['name'] },
        {
            association: 'qcFlags',
            attributes: ['detectorId'],
            include: [
                { association: 'flagType', attributes: ['name'] },
                { association: 'effectivePeriods', attributes: ['from', 'to'] },
            ]
        },
        {
            association: 'eorReasons',
            attributes: ['description'], 
            include: {
                association: 'reasonType',
                attributes: ['category', 'title'], 
            },
        },
    ]
};
