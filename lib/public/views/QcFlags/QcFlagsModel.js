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

import { QcFlagCreationForDataPassModel } from './Create/forDataPass/QcFlagCreationForDataPassModel.js';
import { QcFlagsForDataPassOverviewModel } from './ForDataPass/QcFlagsForDataPassOverviewModel.js';
import { QcFlagsForSimulationPassOverviewModel } from './ForSimulationPass/QcFlagsForSimulationPassOverviewModel.js';
import { QcFlagDetailsForDataPassModel } from './details/forDataPass/QcFlagDetailsForDataPassModel.js';
import { buildUrl, Observable } from '/js/src/index.js';
import { QcFlagCreationForSimulationPassModel } from './Create/forSimulationPass/QcFlagCreationForSimulationPassModel.js';
import { QcFlagDetailsForSimulationPassModel } from './details/forSimulationPass/QcFlagDetailsForSimulationPassModel.js';
import { GaqFlagsOverviewModel } from './GaqFlags/GaqFlagsOverviewModel.js';
import { SynchronousQcFlagsOverviewModel } from './Synchronous/SynchronousQcFlagsOverviewModel.js';

/**
 * Quality Control Flags model
 */
export class QcFlagsModel extends Observable {
    /**
     * The constructor of the model
     * @param {Model} model the global model
     */
    constructor(model) {
        super();
        this.model = model;

        this._forDataPassOverviewModel = new QcFlagsForDataPassOverviewModel();
        this._forDataPassOverviewModel.bubbleTo(this);

        this._forSimulationPassOverviewModel = new QcFlagsForSimulationPassOverviewModel();
        this._forSimulationPassOverviewModel.bubbleTo(this);

        this._synchronousOverviewModel = new SynchronousQcFlagsOverviewModel();
        this._synchronousOverviewModel.bubbleTo(this);

        this._gaqFlagsOverviewModel = new GaqFlagsOverviewModel();
        this._gaqFlagsOverviewModel.bubbleTo(this);
    }

    /**
     * Load the overview page model
     * @param {object} parameters parameters for the model
     * @param {number} parameters.runNumber run number
     * @param {number} parameters.dataPassId data pass id
     * @param {number} parameters.detectorId detector id
     * @returns {void}
     */
    loadForDataPassOverview({ dataPassId, runNumber, detectorId }) {
        this._forDataPassOverviewModel.runNumber = parseInt(runNumber, 10);
        this._forDataPassOverviewModel.dataPassId = parseInt(dataPassId, 10);
        this._forDataPassOverviewModel.detectorId = parseInt(detectorId, 10);
        this._forDataPassOverviewModel.load();
    }

    /**
     * Returns the model for the overview page
     *
     * @return {QcFlagsForDataPassOverviewModel} the overview model
     */
    get forDataPassOverviewModel() {
        return this._forDataPassOverviewModel;
    }

    /**
     * Load the overview page model
     * @param {object} parameters parameters for the model
     * @param {number} parameters.dataPassId data pass id
     * @param {number} parameters.runNumber run number
     * @returns {void}
     */
    loadGaqOverview({ dataPassId, runNumber }) {
        this._gaqFlagsOverviewModel.runNumber = parseInt(runNumber, 10);
        this._gaqFlagsOverviewModel.dataPassId = parseInt(dataPassId, 10);
        this._gaqFlagsOverviewModel.load();
    }

    /**
     * Returns the model for the GAQ overview page
     *
     * @return {GaqFlagsOverviewModel} the overview model
     */
    get gaqOverviewModel() {
        return this._gaqFlagsOverviewModel;
    }

    /**
     * Load the creation for data pass page model
     *
     * @param {Object} parameters - Parameters for the method
     * @param {number} parameters.dataPassId - The data pass ID
     * @param {string} parameters.runNumberDetectorsMap - String representation of run number to detector map
     * @returns {void}
     */
    loadCreationForDataPass({ dataPassId, runNumberDetectorsMap }) {
        const parsedRunNumberDetectorsMap = this._parseRunNumberDetectorMap(runNumberDetectorsMap ?? '');

        this._creationForDataPassModel = new QcFlagCreationForDataPassModel(
            parseInt(dataPassId, 10),
            parsedRunNumberDetectorsMap,
            () => {
                this.model.router.go(buildUrl(
                    '/',
                    { page: 'runs-per-data-pass', dataPassId },
                ));
            },
        );
        this._creationForDataPassModel.bubbleTo(this);
    }

    /**
     * Return the creation for data pass page model
     *
     * @return {QcFlagCreationForDataPassModel} the creation model
     */
    get creationForDataPassModel() {
        return this._creationForDataPassModel;
    }

    /**
     * Load the QC flag details model
     * @param {object} parameters parameters for the model
     * @param {number} parameters.id run number
     * @param {number} parameters.dataPassId data pass id
     * @param {number} parameters.runNumber detector id
     * @param {number} parameters.detectorId detector id
     * @returns {void}
     */
    loadDetailsForDataPass({ id, dataPassId, runNumber, detectorId }) {
        this._detailsForDataPassModel = new QcFlagDetailsForDataPassModel(
            { id: parseInt(id, 10), dataPassId: parseInt(dataPassId, 10) },
            () => this.model.router.go(
                buildUrl(
                    '/',
                    {
                        page: 'qc-flags-for-data-pass',
                        runNumber,
                        dataPassId,
                        detectorId,
                    },
                ),
                true,
            ),
        );
        this._detailsForDataPassModel.bubbleTo(this);
    }

    /**
     * Return the model for QC flag details for data pass page
     *
     * @return {QcFlagDetailsForDataPassModel} the creation model
     */
    get detailsForDataPassModel() {
        return this._detailsForDataPassModel;
    }

    /**
     * Load the overview page model
     * @param {object} parameters parameters for the model
     * @param {number} parameters.simulationPassId simulation pass id
     * @param {number} parameters.runNumber run number
     * @param {number} parameters.detectorId detector id
     * @returns {void}
     */
    loadForSimulationPassOverview({ simulationPassId, runNumber, detectorId }) {
        this._forSimulationPassOverviewModel.runNumber = parseInt(runNumber, 10);
        this._forSimulationPassOverviewModel.simulationPassId = parseInt(simulationPassId, 10);
        this._forSimulationPassOverviewModel.detectorId = parseInt(detectorId, 10);
        this._forSimulationPassOverviewModel.load();
    }

    /**
     * Returns the model for the overview page
     *
     * @return {QcFlagsForSimulationPassOverviewModel} the overview model
     */
    get forSimulationPassOverviewModel() {
        return this._forSimulationPassOverviewModel;
    }

    /**
     * Load the creation for simulation pass page model
     * @param {object} parameters parameters for the model
     * @param {number} parameters.simulationPassId - The simulation pass ID
     * @param {string} parameters.runNumberDetectorsMap - String representation of run number to detector map
     * @returns {void}
     */
    loadCreationForSimulationPass({ simulationPassId, runNumberDetectorsMap }) {
        const parsedRunNumberDetectorMap = this._parseRunNumberDetectorMap(runNumberDetectorsMap ?? '');

        this._creationForSimulationPassModel = new QcFlagCreationForSimulationPassModel(
            parseInt(simulationPassId, 10),
            parsedRunNumberDetectorMap,
            () => {
                this.model.router.go(buildUrl(
                    '/',
                    { page: 'runs-per-simulation-pass', simulationPassId },
                ));
            },
        );

        this._creationForSimulationPassModel.bubbleTo(this);
    }

    /**
     * Return the creation for simulation pass page model
     *
     * @return {QcFlagCreationForSimulationPassModel} the creation model
     */
    get creationForSimulationPassModel() {
        return this._creationForSimulationPassModel;
    }

    /**
     * Load the QC flag details model
     * @param {object} parameters parameters for the model
     * @param {number} parameters.id id
     * @param {number} parameters.simulationPassId simulation pass id
     * @param {number} parameters.runNumber run number
     * @param {number} parameters.detectorId detector id
     * @returns {void}
     */
    loadDetailsForSimulationPass({ id, simulationPassId, runNumber, detectorId }) {
        this._detailsForSimulationPassModel = new QcFlagDetailsForSimulationPassModel(
            { id: parseInt(id, 10), simulationPassId: parseInt(simulationPassId, 10) },
            () => this.model.router.go(buildUrl(
                '/',
                {
                    page: 'qc-flags-for-simulation-pass',
                    runNumber,
                    simulationPassId,
                    detectorId,
                },
            ), true),
        );
        this._detailsForSimulationPassModel.bubbleTo(this);
    }

    /**
     * Return the model for QC flag details for simulation pass page
     *
     * @return {QcFlagDetailsForSimulationPassModel} the creation model
     */
    get detailsForSimulationPassModel() {
        return this._detailsForSimulationPassModel;
    }

    /**
     * Load the overview page model
     * @param {object} parameters parameters for the model
     * @param {number} parameters.runNumber run number
     * @param {number} parameters.detectorId detector id
     * @returns {void}
     */
    loadSynchronousOverview({ runNumber, detectorId }) {
        this._synchronousOverviewModel.runNumber = parseInt(runNumber, 10);
        this._synchronousOverviewModel.detectorId = parseInt(detectorId, 10);
        this._synchronousOverviewModel.load();
    }

    /**
     * Returns the model for the overview page
     *
     * @return {SynchronousQcFlagsOverviewModel} the overview model
     */
    get synchronousOverviewModel() {
        return this._synchronousOverviewModel;
    }

    /**
     * Parse run number detector map string into an object of run numbers mapped to detector IDs
     * @param {string} runNumberDetectorsMapString string with run number detector map
     * @return {Map<number, number[]>} object with run number as keys and detector ids as arrays
     */
    _parseRunNumberDetectorMap(runNumberDetectorsMapString) {
        if (runNumberDetectorsMapString.length === 0) {
            return new Map();
        }

        return new Map(runNumberDetectorsMapString
            .split(';')
            .map((item) => {
                const [runNumber, detectorIds] = item.split(':');
                return [parseInt(runNumber, 10), detectorIds.split(',').map(Number)];
            }));
    }
}
