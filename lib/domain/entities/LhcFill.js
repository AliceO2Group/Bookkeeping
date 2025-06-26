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
 * @typedef LhcFill
 *
 * @property {number} fillNumber - received from BKP-LHC-Client via POST endpoint /api/lhcFills with issued token
 * @property {number|null} stableBeamsStart - received from BKP-LHC-Client via PATCH endpoint /api/lhcFills/:fillNumber with issued token
 * @property {number|null} stableBeamsEnd - received from BKP-LHC-Client via PATCH endpoint /api/lhcFills/:fillNumber with issued token
 * @property {number|null} stableBeamsDuration - received from BKP-LHC-Client via PATCH endpoint /api/lhcFills/:fillNumber with issued token
 * @property {string|null} beamType - received from BKP-LHC-Client via POST endpoint /api/lhcFills with issued token
 * @property {string|null} fillingSchemeName - received from BKP-LHC-Client via POST endpoint /api/lhcFills with issued token
 * and updated by the same client via PATCH endpoint /api/lhcFills/:fillNumber with issued token
 * @property {number|null} collidingBunchesCount - received from LHC_IF service via PATCH endpoint /api/lhcFills/:fillNumber with issued token
 * @property {number|null} deliveredLuminosity - received from LHC_IF service via PATCH endpoint /api/lhcFills/:fillNumber with issued token
 * @property {LhcFillStatistics|null} statistics
 * @property {Run[]} runs
 */
