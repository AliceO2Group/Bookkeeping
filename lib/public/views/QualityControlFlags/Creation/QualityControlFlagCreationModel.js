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

import { SelectionDropdownModel } from '../../../components/common/selection/dropdown/SelectionDropdownModel.js';
import { ObservableData } from '../../../utilities/ObservableData.js';
import { jsonFetch } from '../../../utilities/fetch/jsonFetch.js';
import { RemoteData, Observable } from '/js/src/index.js';

const qcfr = [
    {
        id: 1,
        name: 'Unknown',
        method: 'Unknown',
        bad: true,
        obsolate: true,
    },
    {
        id: 2,
        name: 'UnknownQuality',
        method: 'Unknown Quality',
        bad: true,
        obsolate: true,
    },
    {
        id: 3,
        name: 'CertifiedByExpert',
        method: 'Certified by Expert',
        bad: false,
        obsolate: true,
    },
    {
        id: 10,
        name: 'NoDetectorData',
        method: 'No Detector Data',
        bad: true,
        obsolate: true,
    },
    {
        id: 11,
        name: 'LimitedAcceptance',
        method: 'Limited acceptance',
        bad: true,
        obsolate: true,
    },
    {
        id: 12,
        name: 'BadPID',
        method: 'Bad PID',
        bad: true,
        obsolate: true,
    },
    {
        id: 13,
        name: 'BadTracking',
        method: 'Bad Tracking',
        bad: true,
        obsolate: true,
    },
    {
        id: 14,
        name: 'BadHadronPID',
        method: 'Bad Hadron PID',
        bad: true,
        obsolate: true,
    },
    {
        id: 15,
        name: 'BadElectronPID',
        method: 'Bad Electron PID',
        bad: true,
        obsolate: true,
    },
    {
        id: 16,
        name: 'BadEMCalorimetry',
        method: 'Bad EM Calorimetry',
        bad: true,
        obsolate: true,
    },
    {
        id: 17,
        name: 'BadPhotonCalorimetry',
        method: 'Bad Photon Calorimetry',
        bad: true,
        obsolate: true,
    },
    {
        id: 65500,
        name: 'ObsoleteFlagExample',
        method: 'Obsolete flag example',
        bad: true,
        obsolate: false,
    },
    {
        id: 65501,
        name: 'NotBadFlagExample',
        method: 'Not bad flag example',
        bad: false,
        obsolate: true,
    },
    {
        id: 65535,
        name: 'Invalid',
        method: 'Invalid',
        bad: true,
        obsolate: true,
    },
];

/**
 * Quality Control Flag Creation model
 */
export class QualityControlFlagCreationModel extends Observable {
    /**
     * Constructor
     */
    constructor({
        flagReasonId,
        runNumber,
        dataPassId,
        detectorId,
        externalUserId,
    }) {
        super();

        this._timeStart = null;
        this._timeEnd = null;
        this._provenance = 'HUMAN';
        this._comment = null;
        this._flagReasonId = flagReasonId;
        this._runNumber = runNumber;
        this._dataPassId = dataPassId;
        this._detectorId = detectorId;
        this._externalUserId = externalUserId;

        this._observableCreationResult = new ObservableData(RemoteData.notAsked());
        this._observableCreationResult.bubbleTo(this);

        this._flagReasonsSelectionModel = new SelectionDropdownModel({
            availableOptions: qcfr.map(({ id, method }) => ({ value: id, label: method })),
            defaultSelection: [''],
            multiple: false,
            allowEmpty: false,
        });
        this._flagReasonsSelectionModel.bubbleTo(this);
    }

    /**
     *
     */
    async submit() {
        const {
            timeStart,
            timeEnd,
            provenance,
            comment,
            flagReasonId,
            runNumber,
            dataPassId,
            detectorId,
            externalUserId,
        } = this;

        const options = {
            method: 'POST',
            headers: { Accept: 'application/json' },
            body: JSON.stringify({
                timeStart,
                timeEnd,
                provenance,
                comment,
                flagReasonId,
                runNumber,
                dataPassId,
                detectorId,
                externalUserId,
            }),
        };
        try {
            this._observableCreationResult.setCurrent(RemoteData.loading());
            const result = await jsonFetch('/api/qualityControlFlags', options);
            this._observableCreationResult.setCurrent(RemoteData.failure(result));
        } catch (error) {
            this._observableCreationResult.setCurrent(RemoteData.failure(error));
        }
    }

    set timeStart(timeStart) {
        this._timeStart = timeStart;
    }

    set timeEnd(timeEnd) {
        this._timeEnd = timeEnd;
    }

    set provenance(provenance) {
        this._provenance = provenance;
    }

    set comment(comment) {
        this._comment = comment;
    }

    set flagReasonId(flagReasonId) {
        this._flagReasonId = flagReasonId;
    }

    get timeStart() {
        return this._timeStart;
    }

    get timeEnd() {
        return this._timeEnd;
    }

    get provenance() {
        return this._provenance;
    }

    get comment() {
        return this._comment;
    }

    get flagReasonId() {
        return this._flagReasonId;
    }
}
