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
import { Observable } from '@aliceo2/web-ui/Frontend/js/src/index.js';

/**
 * @typedef AliceMagnetsConfiguration the configuration of the ALICE magnets
 * @property {string} solenoid the configuration of the solenoid
 * @property {string} dipole the configuration of the dipole
 */

/**
 * @typedef AliceMagnetsConfigurationSnapshot
 * @property {number} timestamp the timestamp of the snapshot
 * @property {AliceMagnetsConfiguration} magnetsConfiguration the configuration of the magnet at time of the snapshot
 */

/**
 * Model of form to fill snapshots of ALICE magnets configurations
 */
export class AliceMagnetsConfigurationSnapshotsForm extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();

        /**
         * @type {(AliceMagnetsConfigurationSnapshot|null)[]}
         * @private
         */
        this._snapshots = [];
    }

    /**
     * Add a new empty magnets snapshot configuration
     *
     * @return {void}
     */
    addSnapshot() {
        this._snapshots.push({
            timestamp: undefined,
            magnetsConfiguration: { solenoid: '', dipole: '' },
        });
        this.notify();
    }

    /**
     * Drop the snapshot magnets configuration at the given key
     *
     * @param {number} key the key of the snapshot
     * @return {void}
     */
    dropSnapshot(key) {
        this._snapshots[key] = null;
        this.notify();
    }

    /**
     * Returns the list of all magnet configurations snapshots, including the deleted ones (null)
     *
     * @return {(AliceMagnetsConfigurationSnapshot|null)[]} the magnets configuration snapshots
     */
    get allSnapshots() {
        return this._snapshots;
    }

    /**
     * Return the list of magnet configurations snapshots
     *
     * @return {AliceMagnetsConfigurationSnapshot[]} the magnets configuration snapshots
     */
    get snapshots() {
        return this._snapshots.filter((item) => item !== null);
    }
}
