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

import { ObservableData } from '../../../../utilities/ObservableData.js';
import { Observable, sessionService } from '/js/src/index.js';
import { detectorsProvider } from '../../../../services/detectors/detectorsProvider.js';

/**
 * List of alice systems that are not included in detectors list
 *
 * @type {string[]}
 */
const ALICE_SYSTEMS = ['FLP', 'EPN', 'DCS', 'OTHER', 'CTP', 'PDP', 'QC', 'LHCIF', 'TPC HV', 'RP'];

const SHIFTER_TAGS = {
    DCS: 'DCS Shifter',
    ECS: 'ECS Shifter',
    'QC/PDP': 'QC/PDP Shifter',
    SL: 'Shift Leader',
};

/**
 * @typedef OnCallLogTemplateFormData
 * @property {string} shortDescription
 * @property {string} detectorOrSubsystem
 * @property {string} severity
 * @property {string} scope
 * @property {string} shifterName
 * @property {string} shifterPosition
 * @property {string} lhcBeamMode
 * @property {string} issueDescription
 * @property {string} reason
 * @property {string} alreadyTakenActions
 */

/**
 * Log template for on-call log
 */
export class OnCallLogTemplate extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();

        /**
         * @type {ObservableData<RemoteData<Detector[], ApiError>>}
         * @private
         */
        this._detectors$ = detectorsProvider.all$;
        this._detectors$.bubbleTo(this);

        this._tags = new ObservableData(['oncall']);

        /**
         * @type {Partial<OnCallLogTemplateFormData>}
         */
        this.formData = {
            shortDescription: '',
            shifterName: sessionService.get().name,
            lhcBeamMode: '',
            issueDescription: '',
            reason: '',
            alreadyTakenActions: '',
        };
    }

    /**
     * Apply a patch on current form data
     *
     * @param {Partial<OnCallLogTemplateFormData>} patch the patch to apply
     * @return {void}
     */
    patchFormData(patch) {
        this.formData = {
            ...this.formData,
            ...patch,
        };

        if (patch.shifterPosition || patch.detectorOrSubsystem) {
            const tags = ['oncall', this.formData.detectorOrSubsystem];
            if (this.formData.shifterPosition in SHIFTER_TAGS) {
                tags.push(SHIFTER_TAGS[this.formData.shifterPosition]);
            }
            this.tags$.setCurrent(tags);
        }

        this.notify();
    }

    /**
     * Return the list of names of all the detectors and subsystems
     *
     * @return {RemoteData<string[]>} the list of names
     */
    get detectorsAndSystems() {
        return this._detectors$.getCurrent().apply({
            Success: (detectors) => [
                'ALL',
                ...detectors.map(({ name }) => name),
                ...ALICE_SYSTEMS,
            ],
        });
    }

    /**
     * States if the log creation form is valid
     *
     * @return {boolean} true if the form is valid
     */
    get isValid() {
        return Boolean(this.formData.shortDescription.length >= 4 && this.formData.shortDescription.length <= 100
            && this.formData.detectorOrSubsystem
            && this.formData.severity
            && this.formData.scope
            && this.formData.shifterPosition
            && this.formData.lhcBeamMode.length
            && this.formData.issueDescription.length
            && this.formData.reason.length
            && this.formData.alreadyTakenActions.length);
    }

    /**
     * Return the log title
     *
     * @return {string} the log title
     */
    get title() {
        return `${this.formData.shortDescription} - Call on-call for ${this.formData.detectorOrSubsystem}`;
    }

    /**
     * Return the log text
     *
     * @return {string} the log text
     */
    get text() {
        const textParts = [];
        let importancePart = `## Importance\n${this.formData.severity}`;
        if (this.formData.scope) {
            importancePart = `${importancePart} for ${this.formData.scope}`;
        }
        textParts.push(importancePart);
        textParts.push(`## Shifter\n${this.formData.shifterName} - ${this.formData.shifterPosition}`);
        textParts.push(`## LHC beam mode\n${this.formData.lhcBeamMode}`);
        textParts.push(`## Description\n${this.formData.issueDescription}`);
        textParts.push(`## Reason to call this on-call\n${this.formData.reason}`);
        textParts.push(`## Actions already taken\n${this.formData.alreadyTakenActions}`);

        return textParts.join('\n\n');
    }

    /**
     * Return an observable data of tags to select
     *
     * @return {ObservableData} tags observable data
     */
    get tags$() {
        return this._tags;
    }
}
