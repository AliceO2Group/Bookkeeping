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
import { CombinationOperator, CombinationOperatorChoiceModel } from '../common/CombinationOperatorChoiceModel.js';
import { ObservableBasedSelectionDropdownModel } from '../../detector/ObservableBasedSelectionDropdownModel.js';
import { FilterModel } from '../common/FilterModel.js';

/**
 * Model to store the state of the filtering on a detectors list
 */
export class DetectorsFilterModel extends FilterModel {
    /**
     * Constructor
     *
     * @param {ObservableData<RemoteData<Detector[]>>} detectors$ observable remote data of detectors list
     */
    constructor(detectors$) {
        super();
        this._dropdownModel = new ObservableBasedSelectionDropdownModel(
            detectors$,
            ({ name }) => ({ value: name }),
        );
        this._addSubmodel(this._dropdownModel);

        this._combinationOperatorModel = new CombinationOperatorChoiceModel([
            CombinationOperator.AND,
            CombinationOperator.OR,
            CombinationOperator.NONE,
        ]);
        this._addSubmodel(this._combinationOperatorModel);
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    reset() {
        this._dropdownModel.reset();
        this._combinationOperatorModel.reset();
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    get isEmpty() {
        return this._dropdownModel.isEmpty && !this.isNone();
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    get normalized() {
        const normalized = {
            operator: this._combinationOperatorModel.current,
        };
        if (!this.isNone()) {
            normalized.values = this._dropdownModel.selected.join(',');
        }
        return normalized;
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    async hydrate(normalizedValue) {
        const { operator, values } = normalizedValue;

        this._combinationOperatorModel.select(operator);
        if (values) {
            return this._dropdownModel.setSelectedOptions(values.split(','));
        }

        return Promise.resolve();
    }

    /**
     * Return true if the current combination operator is none
     *
     * @return {boolean} true if the current combination operator is none
     */
    isNone() {
        return this._combinationOperatorModel.current === CombinationOperator.NONE.value;
    }

    /**
     * Return the model storing the list of selected detectors
     *
     * @return {ObservableBasedSelectionDropdownModel} the detectors selection model
     */
    get dropdownModel() {
        return this._dropdownModel;
    }

    /**
     * Return the model storing the combination operator to apply on the list of detectors
     *
     * @return {CombinationOperatorChoiceModel} the model
     */
    get combinationOperatorModel() {
        return this._combinationOperatorModel;
    }
}
