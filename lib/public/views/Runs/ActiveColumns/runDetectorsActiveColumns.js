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
import { h } from '/js/src/index.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { formatDetectorQuality } from '../format/formatDetectorQuality.js';

/**
 * Factory for detectors related active columns configuration
 * @param {DplDetector[]} dplDetectors detectors list
 * @param {object} [options] additional options
 * @param {object|string|string[]} [options.profiles] profiles to which the column is restricted to
 * @param {number} [options.dataPassId] if provided a cell become link to QC flag for given data pass page
 * @param {number} [options.simulationPassId] if provided a cell become link to QC flag for given simulation pass page
 * @return {object} active columns configuration
 */
export const createRunDetectorsActiveColumns = (dplDetectors, { profiles, dataPassId, simulationPassId } = {}) =>
    Object.fromEntries(dplDetectors?.map(({ name: detectorName, id: dplDetectorId }) => [
        detectorName, {
            name: detectorName.toUpperCase(),
            visible: true,
            format: (_, run) => {
                if (dataPassId && simulationPassId) {
                    throw new Error('`dataPassId` are `simulationPassId` are exclusive options');
                }
                const detectorQualityDisplay = dataPassId || simulationPassId
                    ? h('.btn.white.bg-primary', 'QC') // For runs Per Data Pass / Simulation pass
                    // For Runs Per LHC Period
                    : formatDetectorQuality(run.detectorsQualities.find(({ name }) => name === detectorName)?.quality);

                if (dataPassId) {
                    return frontLink(
                        detectorQualityDisplay,
                        'qc-flags-for-data-pass',
                        {
                            dataPassId,
                            runNumber: run.runNumber,
                            dplDetectorId,
                        },
                    );
                }
                if (simulationPassId) {
                    return frontLink(
                        detectorQualityDisplay,
                        'qc-flags-for-simulation-pass',
                        {
                            simulationPassId,
                            runNumber: run.runNumber,
                            dplDetectorId,
                        },
                    );
                }

                return detectorQualityDisplay;
            },
            profiles,
        },
    ]) ?? []);
