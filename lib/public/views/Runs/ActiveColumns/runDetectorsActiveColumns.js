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
import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { formatDetectorQuality } from '../format/formatDetectorQuality.js';

/**
 * Factory for detectors related active columns configuration
 * @param {DplDetector[]} dplDetectors detectors list
 * @param {object} [options] additional options
 * @param {object|string|string[]} [options.profiles] profiles to which the column is restricted to
 * @return {object} active columns configuration
 */
export const createRunDetectorsActiveColumns = (dplDetectors, { profiles, dataPassId } = {}) =>
    Object.fromEntries(dplDetectors?.map(({ name: detectorName, id: dplDetectorId }) => [
        detectorName, {
            name: detectorName.toUpperCase(),
            visible: true,
            format: (_, run) =>
                dataPassId ?
                    frontLink(
                        formatDetectorQuality(run.detectorsQualities.find(({ name }) => name === detectorName)?.quality),
                        'qc-flags',
                        {
                            dataPassId,
                            runNumber: run.runNumber,
                            detectorId: dplDetectorId,
                        },
                    ) : formatDetectorQuality(run.detectorsQualities.find(({ name }) => name === detectorName)?.quality),
            profiles,
        },
    ]) ?? []);
