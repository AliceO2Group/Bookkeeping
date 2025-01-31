/**
 * @license
 * Copyright 2019-2020 CERN and copyright holders of ALICE O2.
 * See http://alice-o2.web.cern.ch/copyright for details of the copyright holders.
 * All rights not expressly granted are reserved.
 *
 * This software is distributed under the terms of the GNU General Public
 * License v3 (GPL Version 3), copied verbatim in the file "COPYING".
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

import { RunQualities } from '../../domain/enums/RunQualities.js';

/**
 * Array of names of tags which prevent run to be subject to QC
 */
export const RUN_TAGS_DISABLING_QC = ['Not for physics'];

/**
 * States whether run is subject to QC
 *
 * @param {Run} run a run
 * @return {boolean} true if run is NOT subject to QC, false otherwise
 */
export const isRunNotSubjectToQc = ({ runQuality, tags }) => runQuality === RunQualities.BAD
    || tags.find(({ text }) => RUN_TAGS_DISABLING_QC.includes(text));

