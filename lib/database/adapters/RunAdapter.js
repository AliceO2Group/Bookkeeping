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

const { getRunDefinition } = require('../../services/getRunDefinition.js');

/**
 * RunAdapter
 */
class RunAdapter {
    /**
     * Constructor
     */
    constructor() {
        /**
         * @type {TagAdapter|null}
         */
        this.tagAdapter = null;

        /**
         * @type {EorReasonAdapter|null}
         */
        this.eorReasonAdapter = null;

        /**
         * @type {RunTypeAdapter|null}
         */
        this.runTypeAdapter = null;

        /**
         * @type {LhcFillAdapter|null}
         */
        this.lhcFillAdapter = null;

        /**
         * @type {DetectorAdapter|null}
         */
        this.detectorAdapter = null;
        this.toEntity = this.toEntity.bind(this);
        this.toDatabase = this.toDatabase.bind(this);
        this.toMinifiedEntity = this.toMinifiedEntity.bind(this);
    }

    /**
     * Converts the given database object to an entity object.
     *
     * @param {SequelizeRun} databaseObject Object to convert.
     * @returns {Run} Converted entity object.
     */
    toEntity(databaseObject) {
        const {
            bytesReadOut,
            dd_flp,
            concatenatedDetectors,
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
            startOfDataTransfer,
            endOfDataTransfer,
            ctfFileCount,
            ctfFileSize,
            tfFileCount,
            tfFileSize,
            otherFileCount,
            otherFileSize,
            lhcFill,
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
            startOfDataTransfer: startOfDataTransfer ? new Date(startOfDataTransfer).getTime() : null,
            endOfDataTransfer: endOfDataTransfer ? new Date(endOfDataTransfer).getTime() : null,
            ctfFileCount,
            ctfFileSize: ctfFileSize !== null ? String(ctfFileSize) : null,
            tfFileCount,
            tfFileSize: tfFileSize !== null ? String(tfFileSize) : null,
            otherFileCount,
            otherFileSize: otherFileSize !== null ? String(otherFileSize) : null,
            lhcFill,
        };
        entityObject.detectors = detectors?.length > 0
            ? detectors.map((detector) => detector.name).join(',')
            : concatenatedDetectors;
        entityObject.runType = runType ? this.runTypeAdapter.toEntity(runType) : runTypeId;
        entityObject.tags = tags ? tags.map(this.tagAdapter.toEntity) : [];
        entityObject.eorReasons = eorReasons ? eorReasons.map(this.eorReasonAdapter.toEntity) : [];
        entityObject.lhcFill = lhcFill ? this.lhcFillAdapter.toEntity(lhcFill) : null;

        return entityObject;
    }

    /**
     * Converts the given entity object to a database object.
     *
     * @param {Partial<Run>} entityObject Object to convert.
     * @returns {Partial<SequelizeRun>} Converted database object.
     */
    toDatabase(entityObject) {
        return {
            timeO2Start: entityObject.timeO2Start,
            timeO2End: entityObject.timeO2End,
            timeTrgStart: entityObject.timeTrgStart,
            timeTrgEnd: entityObject.timeTrgEnd,
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
            runNumber: entityObject.runNumber,
            envId: entityObject.environmentId,
            fillNumber: entityObject.fillNumber,
            lhcBeamEnergy: entityObject.lhcBeamEnergy,
            lhcBeamMode: entityObject.lhcBeamMode,
            lhcBetaStar: entityObject.lhcBetaStar,
            aliceL3Current: entityObject.aliceL3Current,
            aliceDipoleCurrent: entityObject.aliceDipoleCurrent,
            aliceL3Polarity: entityObject.aliceL3Polarity,
            aliceDipolePolarity: entityObject.aliceDipolePolarity,
            pdpConfigOption: entityObject.pdpConfigOption,
            pdpTopologyDescriptionLibraryFile: entityObject.pdpTopologyDescriptionLibraryFile,
            tfbDdMode: entityObject.tfbDdMode,
            lhcPeriod: entityObject.lhcPeriod,
            triggerValue: entityObject.triggerValue,
            odcTopologyFullName: entityObject.odcTopologyFullName,
            pdpWorkflowParameters: entityObject.pdpWorkflowParameters,
            pdpBeamType: entityObject.pdpBeamType,
            readoutCfgUri: entityObject.readoutCfgUri,
            startOfDataTransfer: entityObject.startOfDataTransfer,
            endOfDataTransfer: entityObject.endOfDataTransfer,
            ctfFileCount: entityObject.ctfFileCount,
            ctfFileSize: entityObject.ctfFileSize,
            tfFileCount: entityObject.tfFileCount,
            tfFileSize: entityObject.tfFileSize,
            otherFileCount: entityObject.otherFileCount,
            otherFileSize: entityObject.otherFileSize,
            concatenatedDetectors: entityObject.concatenatedDetectors,

            tags: entityObject.tags?.map(this.tagAdapter.toDatabase),
            lhcFill: entityObject.lhcFill ? this.lhcFillAdapter.toDatabase(entityObject.lhcFill) : null,
        };
    }

    /**
     * Adapts the run entity to a minified version.
     * @param {SequelizeRun} databaseObject run object
     * @returns {MinifiedRun} minified version of the run entity
     */
    toMinifiedEntity(databaseObject) {
        return {
            id: databaseObject.id,
            runNumber: databaseObject.runNumber,
        };
    }
}

exports.RunAdapter = RunAdapter;
