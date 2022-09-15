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
const RunTypeAdapter = require('./RunTypeAdapter');
const { getRunDefinition } = require('../../services/getRunDefinition.js');

/**
 * RunAdapter
 */
class RunAdapter {
    /**
     * Converts the given database object to an entity object.
     *
     * @param {SequelizeRun} databaseObject Object to convert.
     * @returns {Run} Converted entity object.
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
            runTypeId,
            pdpWorkflowParameters,
            pdpBeamType,
            readoutCfgUri,
        } = databaseObject;
        const entityObject = {
            id,
            runNumber,
            timeO2Start: timeO2Start ? new Date(timeO2Start).getTime() : null,
            timeO2End: timeO2End ? new Date(timeO2End).getTime() : null,
            timeTrgStart: timeTrgStart ? new Date(timeTrgStart).getTime() : null,
            timeTrgEnd: timeTrgEnd ? new Date(timeTrgEnd).getTime() : null,
            runDuration,
            environmentId,
            updatedAt: new Date(updatedAt).getTime(),
            createdAt: new Date(updatedAt).getTime(),
            runType,
            definition: getRunDefinition(databaseObject),
            runQuality,
            nDetectors,
            nFlps,
            nEpns,
            dd_flp,
            dcs,
            epn,
            epnTopology,
            detectors,
            nSubtimeframes,
            bytesReadOut,
            envId,
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
        };
        entityObject.runType = runType ? RunTypeAdapter.toEntity(runType) : runTypeId;
        entityObject.tags = tags ? tags.map(TagAdapter.toEntity) : [];
        entityObject.eorReasons = eorReasons ? eorReasons.map(EorReasonAdapter.toEntity) : [];

        return entityObject;
    }

    /**
     * Converts the given entity object to a database object.
     *
     * @param {Partial<Run>} entityObject Object to convert.
     * @returns {Partial<SequelizeRun>} Converted database object.
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
            runTypeId: entityObject.runTypeId,
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
            pdpWorkflowParameters: entityObject.pdpWorkflowParameters,
            pdpBeamType: entityObject.pdpBeamType,
            readoutCfgUri: entityObject.readoutCfgUri,
        };
    }

    /**
     * Adapts the run entity to a minified version.
     * @param {SequelizeRun} databaseObject run object
     * @returns {MinifiedRun} minified version of the run entity
     */
    static toMinifiedEntity(databaseObject) {
        return {
            id: databaseObject.id,
            runNumber: databaseObject.runNumber,
        };
    }
}

module.exports = RunAdapter;
