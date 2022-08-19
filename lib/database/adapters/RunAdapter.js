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

const TagAdapter = require('./TagAdapter');
const EorReasonAdapter = require('./EorReasonAdapter');

/**
 * RunAdapter
 */
class RunAdapter {
    /**
     * Converts the given database object to an entity object.
     *
     * @param {Object} databaseObject Object to convert.
     * @returns {Object} Converted entity object.
     */
    static toEntity(databaseObject) {
        const {
            bytesReadOut,
            dd_flp,
            dcs,
            detectors,
            eorReasons,
            epn,
            epnTopology,
            envId,
            environmentId,
            id,
            nDetectors,
            nFlps,
            nEpns,
            nSubtimeframes,
            runNumber,
            runType,
            runQuality,
            timeO2Start,
            timeO2End,
            timeTrgStart,
            timeTrgEnd,
            runDuration,
            tags,
            updatedAt,
            fillNumber,
            lhcBeamEnergy,
            lhcBeamMode,
            lhcBetaStar,
            aliceL3Current,
            aliceDipoleCurrent,
            aliceL3Polarity,
            aliceDipolePolarity,
            odcTopologyFullName,
            pdpConfigOption,
            pdpTopologyDescriptionLibraryFile,
            tfbDdMode,
            lhcPeriod,
            triggerValue,
            pdpWorkflowParameters,
            pdpBeamType,
            readoutCfgUri,
        } = databaseObject;

        const entityObject = {
            id: id,
            runNumber: runNumber,
            timeO2Start: timeO2Start ? new Date(timeO2Start).getTime() : null,
            timeO2End: timeO2End ? new Date(timeO2End).getTime() : null,
            timeTrgStart: timeTrgStart ? new Date(timeTrgStart).getTime() : null,
            timeTrgEnd: timeTrgEnd ? new Date(timeTrgEnd).getTime() : null,
            runDuration,
            environmentId: environmentId,
            updatedAt: new Date(updatedAt).getTime(),
            runType: runType,
            runQuality: runQuality,
            nDetectors: nDetectors,
            nFlps: nFlps,
            nEpns: nEpns,
            dd_flp: dd_flp,
            dcs: dcs,
            epn: epn,
            epnTopology: epnTopology,
            detectors: detectors,
            nSubtimeframes: nSubtimeframes,
            bytesReadOut: bytesReadOut,
            envId: envId,
            fillNumber: fillNumber,
            lhcBeamEnergy: lhcBeamEnergy,
            lhcBeamMode: lhcBeamMode,
            lhcBetaStar: lhcBetaStar,
            aliceL3Current: aliceL3Current,
            aliceDipoleCurrent: aliceDipoleCurrent,
            aliceL3Polarity: aliceL3Polarity,
            aliceDipolePolarity: aliceDipolePolarity,
            odcTopologyFullName: odcTopologyFullName,
            pdpConfigOption: pdpConfigOption,
            pdpTopologyDescriptionLibraryFile: pdpTopologyDescriptionLibraryFile,
            tfbDdMode: tfbDdMode,
            lhcPeriod: lhcPeriod,
            triggerValue: triggerValue,
            pdpWorkflowParameters: pdpWorkflowParameters,
            pdpBeamType: pdpBeamType,
            readoutCfgUri: readoutCfgUri,
        };

        entityObject.tags = tags ? tags.map(TagAdapter.toEntity) : [];
        entityObject.eorReasons = eorReasons ? eorReasons.map(EorReasonAdapter.toEntity) : [];

        return entityObject;
    }

    /**
     * Converts the given entity object to a database object.
     *
     * @param {Object} entityObject Object to convert.
     * @returns {Object} Converted database object.
     */
    static toDatabase(entityObject) {
        return {
            runNumber: entityObject.runNumber,
            timeO2Start: entityObject.timeO2Start,
            timeO2End: entityObject.timeO2End,
            timeTrgStart: entityObject.timeTrgStart,
            timeTrgEnd: entityObject.timeTrgEnd,
            triggerValue: entityObject.triggerValue,
            environmentId: entityObject.environmentId,
            runType: entityObject.runType,
            runQuality: entityObject.runQuality,
            nDetectors: entityObject.nDetectors,
            nFlps: entityObject.nFlps,
            nEpns: entityObject.nEpns,
            nSubtimeframes: entityObject.nSubtimeframes,
            bytesReadOut: entityObject.bytesReadOut,
            dd_flp: entityObject.dd_flp,
            dcs: entityObject.dcs,
            epn: entityObject.epn,
            epnTopology: entityObject.epnTopology,
            detectors: entityObject.detectors,
            tags: entityObject.tags,
            envId: entityObject.environmentId,
            odcTopologyFullName: entityObject.odcTopologyFullName,
        };
    }
}

module.exports = RunAdapter;
