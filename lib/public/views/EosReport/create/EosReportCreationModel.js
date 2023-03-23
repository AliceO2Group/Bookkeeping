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

import { Observable, RemoteData } from '/js/src/index.js';
import { jsonFetch } from '../../../utilities/fetch/jsonFetch.js';

/**
 * Model to store the EOS report creation page's state
 */
export class EosReportCreationModel extends Observable {
    /**
     * Constructor
     * @param {function} onCreationSuccess function called when the EOS report creation is successful, passing the created log ID as parameter
     */
    constructor(onCreationSuccess) {
        super();

        /**
         * No need for a class for now
         * If fields need complex verification/formatting or anything else use a class
         *
         * @type {Partial<EosReportCreationRequest>}
         */
        this.data = {
            typeSpecific: null,
        };

        this._creationStatus = RemoteData.notAsked();
        this._onCreationSuccess = onCreationSuccess;

        this.submit = this.submit.bind(this);
    }

    /**
     * Reset the creation model to its initial state
     * @return {void}
     */
    reset() {
        this.data = {
            typeSpecific: null,
        };

        this._creationStatus = RemoteData.notAsked;
    }

    /**
     * Submit the current EOS report creation request, update the creationStatus and notify during the process
     *
     * @return {Promise<void>} resolves once the creation has been finished
     */
    async submit() {
        try {
            this._creationStatus = RemoteData.loading();
            this.notify();

            const options = {
                method: 'POST',
                headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
                body: JSON.stringify(this.data),
            };
            const { data: { id } } = await jsonFetch('/api/eos-report?reportType=ECS', options);
            this._creationStatus = RemoteData.success(null);
            this._onCreationSuccess(id);
            this.reset();
        } catch (errors) {
            this._creationStatus = RemoteData.failure(errors);
        }
        this.notify();
    }

    /**
     * Returns the log creation request status
     *
     * @return {RemoteData} the creation status
     */
    get creationStatus() {
        return this._creationStatus;
    }
}
