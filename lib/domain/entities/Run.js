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
 * @typedef Run
 *
 * @property {number} id
 * @property {Date|null} timeO2Start
 * @property {Date|null} timeO2End
 * @property {Date|null} timeTrgStart
 * @property {Date|null} timeTrgEnd
 * @property {number|null} userIdO2Start relation to the user id that started the run
 * @property {number|null} userIdO2Stop relation to the user id that stopped the run
 * @property {Date|null} startTime timestamp of the run's start, either trigger start if it exists or o2 start or null
 * @property {Date|null} endTime timestamp of the run's end, either trigger end if it exists or o2 end or now (always null if start is null)
 * @property {string|null} environmentId
 * @property {number|null} runTypeId
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
 * @property {string|null} detectors
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
 * @property {string|null} pdpConfigOption
 * @property {string|null} pdpTopologyDescriptionLibraryFile
 * @property {string|null} tfbDdMode
 * @property {string|null} lhcPeriod
 * @property {string|null} triggerValue
 * @property {string|null} odcTopologyFullName
 * @property {string|null} pdpWorkflowParameters
 * @property {string|null} pdpBeamType
 * @property {string|null} readoutCfgUri
 * @property {number|null} startOfDataTransfer
 * @property {number|null} endOfDataTransfer
 * @property {string|null} ctfFileCount
 * @property {string|null} ctfFileSize
 * @property {string|null} tfFileCount
 * @property {string|null} tfFileSize
 * @property {string|null} otherFileCount
 * @property {string|null} otherFileSize
 * @property {number|null} muInelasticInteractionRate
 * @property {number|null} inelasticInteractionRateAvg
 * @property {number|null} inelasticInteractionRateAtStart
 * @property {number|null} inelasticInteractionRateAtMid
 * @property {number|null} inelasticInteractionRateAtEnd
 * @property {number|null} crossSection
 * @property {number|null} triggerEfficiency
 * @property {number|null} triggerAcceptance
 * @property {number|null} phaseShiftAtStartBeam1
 * @property {number|null} phaseShiftAtStartBeam2
 * @property {number|null} phaseShiftAtEndBeam1
 * @property {number|null} phaseShiftAtEndBeam2
 * @property {Date} updatedAt
 * @property {Date} createdAt
 * @property {number|null} runDuration
 * @property {RunDetectorQuality[]} detectorsQualities
 * @property {string|null} definition
 * @property {string|null} calibrationStatus
 * @property {Log[]} logs
 * @property {Tag[]} tags
 * @property {FlpRole[]} flpRoles
 * @property {EorReason[]} eorReasons
 * @property {RunType|null} runType
 * @property {LhcFill} lhcFill
 */

/**
 * @typedef MinifiedRun
 * @property {number} id
 * @property {number} runNumber
 */
