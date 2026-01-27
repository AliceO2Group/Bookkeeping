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
 * @typedef SequelizeBeamMode
 *
 * BeamMode is currently a string column in the runs table, but we define this typedef as if it were a full model for future use.
 * BeamMode should become independent entity in the future. [O2B-1499]
 *
 * @property {string} name
 */
