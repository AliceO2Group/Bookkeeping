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

const { PhysicalConstant } = require('../../domain/enums/PhysicalConstant');

/**
 * Extract number of colliding LHC bunch crossing (for ALICE) from LHC fill schema
 * @param {string} fillingSchema filling schema
 * @return {number} number of colliding LHC bunch crossing
 */
const extractNumberOfCollidingLhcBunchCrossings = (fillingSchema) => {
    const collidingLhcBunchCrossingsInFillSchemaRegex = /[A-Za-z0-9]+_[A-Za-z0-9]+_[0-9]+_([0-9]+)_.*/;
    const [, matchedValueForAlice] = fillingSchema?.match(collidingLhcBunchCrossingsInFillSchemaRegex) || [];
    if (!matchedValueForAlice) {
        return null;
    }
    return parseInt(matchedValueForAlice, 10);
};

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
         * @type {FlpRoleAdapter|null}
         */
        this.flpRoleAdapter = null;

        /**
         * @type {LogAdapter|null}
         */
        this.logAdapter = null;

        /**
         * @type {LhcPeriodAdapter|null}
         */
        this.lhcPeriodAdapter = null;

        /**
         * @type {UserAdapter|null}
         */
        this.userAdapter = null;

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
            firstTfTimestamp,
            lastTfTimestamp,
            userIdO2Start,
            userIdO2Stop,
            startTime,
            endTime,
            qcTimeStart,
            qcTimeEnd,
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
            lhcPeriodId,
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
            nTfOrbits,
            lhcFill,
            flpRoles,
            logs,
            definition,
            calibrationStatus,
            inelasticInteractionRateAvg,
            inelasticInteractionRateAtStart,
            inelasticInteractionRateAtMid,
            inelasticInteractionRateAtEnd,
            crossSection,
            triggerEfficiency,
            triggerAcceptance,
            rawCtpTriggerConfiguration,
            phaseShiftAtStartBeam1,
            phaseShiftAtStartBeam2,
            phaseShiftAtEndBeam1,
            phaseShiftAtEndBeam2,
            userStart,
            userStop,
        } = databaseObject;

        /**
         * @type {Run}
         */
        const entityObject = {
            id,
            runNumber,
            timeO2Start: timeO2Start ? new Date(timeO2Start).getTime() : timeO2Start,
            timeO2End: timeO2End ? new Date(timeO2End).getTime() : timeO2End,
            timeTrgStart: timeTrgStart ? new Date(timeTrgStart).getTime() : timeTrgStart,
            timeTrgEnd: timeTrgEnd ? new Date(timeTrgEnd).getTime() : timeTrgEnd,
            firstTfTimestamp: firstTfTimestamp ? new Date(firstTfTimestamp).getTime() : firstTfTimestamp,
            lastTfTimestamp: lastTfTimestamp ? new Date(lastTfTimestamp).getTime() : lastTfTimestamp,
            userIdO2Start,
            userIdO2Stop,
            startTime,
            endTime,
            qcTimeStart: qcTimeStart ? new Date(qcTimeStart).getTime() : qcTimeStart,
            qcTimeEnd: qcTimeEnd ? new Date(qcTimeEnd).getTime() : qcTimeEnd,
            runDuration,
            environmentId,
            updatedAt: new Date(updatedAt).getTime(),
            runType,
            definition,
            calibrationStatus,
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
            lhcPeriodId,
            triggerValue,
            pdpWorkflowParameters,
            pdpBeamType,
            readoutCfgUri,
            startOfDataTransfer: startOfDataTransfer ? new Date(startOfDataTransfer).getTime() : startOfDataTransfer,
            endOfDataTransfer: endOfDataTransfer ? new Date(endOfDataTransfer).getTime() : endOfDataTransfer,
            ctfFileCount,
            ctfFileSize: ctfFileSize !== null ? String(ctfFileSize) : null,
            tfFileCount,
            tfFileSize: tfFileSize !== null ? String(tfFileSize) : null,
            otherFileCount,
            otherFileSize: otherFileSize !== null ? String(otherFileSize) : null,
            nTfOrbits: nTfOrbits !== null ? String(nTfOrbits) : null,
            lhcFill,
            crossSection,
            triggerEfficiency,
            triggerAcceptance,
            rawCtpTriggerConfiguration,
            phaseShiftAtStartBeam1,
            phaseShiftAtStartBeam2,
            phaseShiftAtEndBeam1,
            phaseShiftAtEndBeam2,
        };

        if (detectors) {
            detectors.sort(({ name: name1 }, { name: name2 }) => name1.localeCompare(name2));
            entityObject.detectors = detectors.map((detector) => detector.name).join(',');
            entityObject.detectorsQualities = detectors
                .map((detector) => {
                    if (!detector.RunDetectors) {
                        return null;
                    }
                    return { id: detector.id, name: detector.name, quality: detector.RunDetectors.quality };
                })
                .filter((item) => Boolean(item));
        } else {
            entityObject.detectors = null;
            entityObject.detectorsQualities = [];
        }

        entityObject.runType = runType ? this.runTypeAdapter.toEntity(runType) : runTypeId;
        entityObject.tags = tags ? tags.map(this.tagAdapter.toEntity) : [];
        entityObject.eorReasons = eorReasons ? eorReasons.map(this.eorReasonAdapter.toEntity) : [];
        entityObject.logs = logs ? logs.map(this.logAdapter.toEntity) : [];
        entityObject.lhcFill = lhcFill ? this.lhcFillAdapter.toEntity(lhcFill) : lhcFill;
        entityObject.flpRoles = flpRoles ? flpRoles.map(this.flpRoleAdapter.toEntity) : [];
        entityObject.lhcPeriod = lhcPeriod ? this.lhcPeriodAdapter.toEntity(lhcPeriod) : lhcPeriod;
        entityObject.userStart = userStart ? this.userAdapter.toNameOnly(userStart) : userStart;
        entityObject.userStop = userStop ? this.userAdapter.toNameOnly(userStop) : userStop;

        entityObject.inelasticInteractionRateAvg = inelasticInteractionRateAvg;
        entityObject.inelasticInteractionRateAtStart = inelasticInteractionRateAtStart;
        entityObject.inelasticInteractionRateAtMid = inelasticInteractionRateAtMid;
        entityObject.inelasticInteractionRateAtEnd = inelasticInteractionRateAtEnd;
        if (lhcFill && inelasticInteractionRateAvg !== null) {
            const collidingBunchesCount = lhcFill.collidingBunchesCount ?? extractNumberOfCollidingLhcBunchCrossings(lhcFill.fillingSchemeName);
            entityObject.muInelasticInteractionRate = collidingBunchesCount
                ? inelasticInteractionRateAvg / (collidingBunchesCount * PhysicalConstant.LHC_REVOLUTION_FREQUENCY_HZ)
                : null;
        } else {
            entityObject.muInelasticInteractionRate = null;
        }

        entityObject.collidingBunchesCount = lhcFill
            ? lhcFill.collidingBunchesCount ?? extractNumberOfCollidingLhcBunchCrossings(lhcFill.fillingSchemeName)
            : null;

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
            firstTfTimestamp: entityObject.firstTfTimestamp,
            lastTfTimestamp: entityObject.lastTfTimestamp,
            userIdO2Start: entityObject.userIdO2Start,
            userIdO2Stop: entityObject.userIdO2Stop,
            startTime: entityObject.startTime,
            endTime: entityObject.endTime,
            qcTimeStart: entityObject.qcTimeStart,
            qcTimeEnd: entityObject.qcTimeEnd,
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
            lhcPeriodId: entityObject.lhcPeriodId,
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
            nTfOrbits: entityObject.nTfOrbits,
            concatenatedDetectors: entityObject.detectors,
            definition: entityObject.definition,
            calibrationStatus: entityObject.calibrationStatus,

            inelasticInteractionRateAvg: entityObject.inelasticInteractionRateAvg,
            inelasticInteractionRateAtStart: entityObject.inelasticInteractionRateAtStart,
            inelasticInteractionRateAtMid: entityObject.inelasticInteractionRateAtMid,
            inelasticInteractionRateAtEnd: entityObject.inelasticInteractionRateAtEnd,
            crossSection: entityObject.crossSection,
            triggerEfficiency: entityObject.triggerEfficiency,
            triggerAcceptance: entityObject.triggerAcceptance,
            rawCtpTriggerConfiguration: entityObject.rawCtpTriggerConfiguration,
            phaseShiftAtStartBeam1: entityObject.phaseShiftAtStartBeam1,
            phaseShiftAtStartBeam2: entityObject.phaseShiftAtStartBeam2,
            phaseShiftAtEndBeam1: entityObject.phaseShiftAtEndBeam1,
            phaseShiftAtEndBeam2: entityObject.phaseShiftAtEndBeam2,

            logs: entityObject.logs?.map(this.logAdapter.toDatabase),
            tags: entityObject.tags?.map(this.tagAdapter.toDatabase),
            lhcFill: entityObject.lhcFill ? this.lhcFillAdapter.toDatabase(entityObject.lhcFill) : entityObject.lhcFill,
            lhcPeriod: entityObject.lhcPeriod ? this.lhcPeriodAdapter.toDatabase(entityObject.lhcPeriod) : entityObject.lhcPeriod,
            userStart: entityObject.userStart ? this.userAdapter.toDatabase(entityObject.userStart) : entityObject.userStart,
            userStop: entityObject.userStop ? this.userAdapter.toDatabase(entityObject.userStop) : entityObject.userStop,
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

    /**
     * Converts a run entity to a gRPC run message
     *
     * @param {Run} run the run to convert to gRPC
     * @return {Object} the run message
     */
    toGRPC(run) {
        // The gRPC proto expect a list of detectors, do the conversion
        const detectors = run.detectors?.split(',')?.map((detector) => detector.trim());
        // The proto expect the run type name and not the run type related entity
        const runType = run.runType?.name ?? undefined;
        const { lhcPeriod } = run;

        return {
            ...run,
            detectors,
            runType,
            lhcPeriod: lhcPeriod?.name,
        };
    }
}

exports.RunAdapter = RunAdapter;
