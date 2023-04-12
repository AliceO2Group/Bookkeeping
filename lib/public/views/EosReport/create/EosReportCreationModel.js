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
import { jsonPost } from '../../../utilities/fetch/jsonPost.js';

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

        this._creationResult = RemoteData.notAsked();
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

        this._creationResult = RemoteData.notAsked;
    }

    /**
     * Submit the current EOS report creation request, update the creationStatus and notify during the process
     *
     * @return {Promise<void>} resolves once the creation has been finished
     */
    async submit() {
        this._creationResult = RemoteData.loading();
        this.notify();

        try {
            const { data: { id } } = await jsonPost('/api/eos-report?reportType=ECS', this.data);

            this._creationResult = RemoteData.success(null);
            this._onCreationSuccess(id);
            this.reset();
        } catch (errors) {
            this._creationResult = RemoteData.failure(errors);
        }
        this.notify();
    }

    /**
     * Returns the log creation request status
     *
     * @return {RemoteData} the creation status
     */
    get creationResult() {
        return this._creationResult;
    }
}
