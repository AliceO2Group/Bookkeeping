/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

/**
 * @typedef SequelizeLhcFillStatistics
 *
 * @property {number} fillNumber the fill number to which the statistics applies to
 * @property {number} runsCoverage total duration covered by at least one run (in seconds)
 * @property {string} efficiency efficiency of the fill
 * @property {number} timeLossAtStart duration between the start of the fill and the start of the first run (in seconds)
 * @property {string} efficiencyLossAtStart percentage of duration not covered by any run at the start of fill compared
 *     to the global fill duration
 * @property {number} timeLossAtEnd duration between the end of the last run and the end of the fill (in seconds)
 * @property {string} efficiencyLossAtEnd percentage of duration not covered by any run at the end of fill compared to
 *     the global fill duration
 * @property {string} meanRunDuration mean of the runs duration (in seconds)
 * @property {number} totalCtfFileSize total cft file size across all the good physics runs
 * @property {number} totalTfFileSize total ft file size across all the good physics runs
 */
