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
import { LogCreationModel } from './LogCreationModel.js';
import { getRemoteData } from '../../../utilities/fetch/getRemoteData.js';
import { tagToOption } from '../../../components/tag/tagToOption.js';
import { RemoteData } from '/js/src/index.js';

/**
 * Model for log reply creation
 */
export class LogReplyModel extends LogCreationModel {
    /**
     * Constructor
     *
     * @param {function} onCreation function called when the log has been created with the id of the created log as a parameter
     * @param {number} parentLogId the id of the parent log
     */
    constructor(onCreation, parentLogId) {
        super(onCreation, {});

        this._parentLogId = parentLogId;

        this._parentLog = RemoteData.loading();
        getRemoteData(`/api/logs/${this._parentLogId}`).then(
            ({ data: parentLog }) => {
                this._parentLog = RemoteData.success(parentLog);
                this.inheritFromParentLog(parentLog);
            },
            (errors) => {
                this._parentLog = RemoteData.failure(errors);
            },
        ).finally(() => this.notify());

        this._isParentLogCollapsed = true;
    }

    /**
     * Inherit the title, tags, runs, environments and lhcFills from the parent log
     *
     * @param {Log} parentLog the parent log
     * @return {void}
     */
    inheritFromParentLog(parentLog) {
        const { title, tags, runs, environments, lhcFills } = parentLog;

        this.title = `${title}`;

        if (this.tagsPickerModel.hasOnlyDefaultSelection()) {
            this.tagsPickerModel.selectedOptions = tags.map(tagToOption);
        }

        if (!this.runNumbers) {
            this.runNumbers = runs.map(({ runNumber }) => runNumber).join(', ');
        }

        if (!this.environments) {
            this.environments = environments.map(({ id }) => id).join(', ');
        }

        if (!this.lhcFills) {
            this.lhcFills = lhcFills.map(({ fillNumber }) => fillNumber).join(', ');
        }
    }

    /**
     * Returns the current parent log as a remote data
     * If the log do not have a parent log, the value will be success(null)
     *
     * @return {RemoteData} the parent log
     */
    get parentLog() {
        return this._parentLog;
    }
}
