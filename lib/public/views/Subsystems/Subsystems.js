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
import { Observable, RemoteData, fetchClient } from '/js/src/index.js';

/**
 * Subsystem model
 */
class SubsystemModel extends Observable {
    /**
     * Creates a new `Subsystem Model` instance.
     *
     * @param {*} model Pass the model to access the defined functions.
     * @returns {undefined}
     */
    constructor(model) {
        super();
        this.model = model;

        // Overview
        this.clearSubsystems();

        // Detail
        this.clearSubsystem();
    }

    /**
     * Returns the Subsystem data.
     *
     * @returns {RemoteData} The Subsystem data.
     */
    getSubsystem() {
        return this.subsystem;
    }

    /**
     * Returns the Logs of a subsystem.
     *
     * @returns {RemoteData} The Logs of a Subsystem.
     */
    getLogsOfSubsystem() {
        return this.logsOfSubsystem;
    }

    /**
     * Returns the Subsystem data.
     *
     * @returns {RemoteData} The Subsystems data.
     */
    getSubsystems() {
        return this.subsystems;
    }

    /**
     * Fetches all Subsystems.
     *
     * @returns {undefined}
     */
    async fetchAllSubsystems() {
        if (this.getSubsystems().isSuccess()) {
            // We already have this panel
            return;
        }

        this.subsystems = RemoteData.loading();
        this.notify();

        const response = await fetchClient('/api/subsystems');
        const result = await response.json();

        if (result.data) {
            this.subsystems = RemoteData.success(result.data);
        } else {
            this.subsystems = RemoteData.failure(result.errors);
        }

        this.notify();
    }

    /**
     * Fetches the Subsystems data.
     *
     * @param {*} subsystemId Id of the subsystem.
     * @returns {undefined}
     */
    async fetchOneSubsystem(subsystemId) {
        if (this.getSubsystem().isSuccess()) {
            // We already have this panel
            return;
        }

        this.subsystem = RemoteData.loading();
        this.notify();

        const response = await fetchClient(`/api/subsystems/${subsystemId}`);
        const result = await response.json();

        if (result.data) {
            this.subsystem = RemoteData.success(result.data);
        } else {
            this.subsystem = RemoteData.failure(result.errors);
        }

        this.notify();
    }

    /**
     * Fetches the logs with provided subsystem.
     *
     * @param {*} subsystemId Id of the subsystem.
     * @returns {undefined}
     */
    async fetchLogsOfSubsystem(subsystemId) {
        if (this.getLogsOfSubsystem().isSuccess()) {
            // We already have this panel
            return;
        }

        this.logsOfSubsystem = RemoteData.loading();
        this.notify();

        const response = await fetchClient(`/api/subsystems/${subsystemId}/logs`);
        const result = await response.json();

        if (result.data) {
            this.logsOfSubsystem = RemoteData.success(result.data);
        } else {
            this.logsOfSubsystem = RemoteData.failure(result.errors);
        }

        this.notify();
    }

    /**
     * Sets all data related to the Subsystem to `NotAsked`.
     *
     * @returns {undefined}
     */
    clearSubsystem() {
        this.subsystem = RemoteData.NotAsked();
        this.logsOfSubsystem = RemoteData.NotAsked();
    }

    /**
     * Sets all data related to the Subsystem to `NotAsked`.
     *
     * @returns {undefined}
     */
    clearSubsystems() {
        this.subsystems = RemoteData.NotAsked();
    }
}

export default SubsystemModel;
