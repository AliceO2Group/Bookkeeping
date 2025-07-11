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

/**
 * @typedef SequelizeRun
 *
 * @property {number} id
 * @property {string|null} timeO2Start
 * @property {string|null} timeO2End
 * @property {string|null} timeTrgStart
 * @property {string|null} timeTrgEnd
 * @property {string|null} firstTfTimestamp
 * @property {string|null} lastTfTimestamp
 * @property {number|null} userIdO2Start relation to the user id that started the run
 * @property {number|null} userIdO2Stop relation to the user id that stopped the run
 * @property {number|null} startTime timestamp of the run's start, either trigger start if it exists or o2 start or null
 * @property {number|null} endTime timestamp of the run's end, either trigger end if it exists or o2 end or now (always null if start is null)
 * @property {number|null} qcTimeStart coalesce of run first TF timestamp, trigger start and run o2 start
 * @property {number|null} qcTimeEnd coalesce of run last TF timestamp, trigger stop and run o2 end
 * @property {string|null} environmentId
 * @property {string} runQuality
 * @property {number|null} nDetectors
 * @property {number|null} nFlps
 * @property {number|null} nEpns
 * @property {number|null} nSubtimeframes
 * @property {number|null} bytesReadOut
 * @property {boolean|null} dd_flp
 * @property {boolean|null} dcs
 * @property {boolean|null} epn
 * @property {string|null} epnTopology
 * @property {number} runNumber
 * @property {string|null} envId
 * @property {number|null} fillNumber
 * @property {number|null} lhcBeamEnergy
 * @property {string|null} lhcBeamMode
 * @property {number|null} lhcBetaStar
 * @property {number|null} aliceL3Current
 * @property {number|null} aliceDipoleCurrent
 * @property {string|null} aliceL3Polarity
 * @property {string|null} aliceDipolePolarity
 * @property {boolean|null} trgGlobalRunEnabled
 * @property {boolean|null} trgEnabled
 * @property {string|null} pdpConfigOption
 * @property {string|null} pdpTopologyDescriptionLibraryFile
 * @property {string|null} tfbDdMode
 * @property {string|null} lhcPeriod
 * @property {string|null} triggerValue
 * @property {string|null} odcTopologyFullName
 * @property {number|null} runTypeId
 * @property {string|null} pdpWorkflowParameters
 * @property {string|null} pdpBeamType
 * @property {string|null} readoutCfgUri
 * @property {string|null} startOfDataTransfer
 * @property {string|null} endOfDataTransfer
 * @property {string|null} ctfFileCount
 * @property {string|number|null} ctfFileSize
 * @property {string|null} tfFileCount
 * @property {string|number|null} tfFileSize
 * @property {string|null} otherFileCount
 * @property {string|number|null} otherFileSize
 * @property {string|number|null} nTfOrbits
 * @property {number|null} inelasticInteractionRateAvg
 * @property {number|null} inelasticInteractionRateAtStart
 * @property {number|null} inelasticInteractionRateAtMid
 * @property {number|null} inelasticInteractionRateAtEnd
 * @property {number|null} crossSection
 * @property {number|null} triggerEfficiency
 * @property {number|null} triggerAcceptance
 * @property {string|null} rawCtpTriggerConfiguration
 * @property {number|null} phaseShiftAtEndBeam1
 * @property {number|null} phaseShiftAtEndBeam2
 * @property {number|null} phaseShiftAtStartBeam1
 * @property {number|null} phaseShiftAtStartBeam2
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {number|null} runDuration
 * @property {string} definition
 * @property {string} calibrationStatus
 * @property {{detector: string, quality: string}} detectorsQualities the list of qualities for each related detectors (detectors are
 *     represented by their name)
 * @property {SequelizeTag[]|null} tags
 * @property {SequelizeDetector[]|null} detectors
 * @property {SequelizeEorReason[]|null} eorReasons
 * @property {SequelizeFlpRole[]|null} flpRoles
 * @property {SequelizeLhcFill|null} lhcFill
 * @property {SequelizeRunType|null} runType
 * @property {SequelizeLog[]|null} logs
 * @property {SequelizeUser[]|null} userStart
 * @property {SequelizeUser[]|null} userStop
 *
 */
