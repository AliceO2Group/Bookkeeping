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
import { formatDetectorQuality } from '../format/formatDetectorQuality.js';

/**
 * Factory for detectors related active columns configuration
 * @param {Detector[]} detectors detectors list
 * @return {object} active columns configuration
 */
export const createRunDetectorsActiveColumns = (detectors) => Object.fromEntries(detectors?.map(({ name: detectorName }) => [
    detectorName, {
        name: detectorName.toUpperCase(),
        visible: true,
        format: (_, run) => formatDetectorQuality(run.detectorsQualities.find(({ name }) => name === detectorName)?.quality),
        profiles: ['runsPerLhcPeriod'],
    },
]) ?? []);
