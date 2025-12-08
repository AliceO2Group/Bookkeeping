import { BeamModes } from '../../../domain/enums/BeamModes.js';
import { SelectionFilterModel } from '../common/filters/SelectionFilterModel.js';

/**
 * Beams mode filter model.
 */
export class BeamsModeFilterModel extends SelectionFilterModel {
    /**
     * Constructor
     */
    constructor() {
        super({ availableOptions: [{ value: BeamModes.STABLE_BEAMS }] });
    }

    /**
     * Returns true if the current filter is stable beams only
     *
     * @returns {boolean} true if filter is stable beams only
     */
    isStableBeamsOnly() {
        const selectedOptions = this._selectionModel.selected;
        return selectedOptions.length === 1 && selectedOptions[0] === BeamModes.STABLE_BEAMS;
    }

    /**
     * Sets the current filter to be stable beams only.
     * @param {boolean} value wether to have stable beams only true or false
     */
    setStableBeamsOnly(value) {
        switch (value) {
            case true:
                this._selectionModel.selectedOptions = [];
                this._selectionModel.select(BeamModes.STABLE_BEAMS);
                break;
            case false:
                this.reset();
                this.notify();
                break;
            default:
                break;
        }
    }

    /**
     * Empty the filter
     */
    setEmpty() {
        if (!this.isEmpty) {
            this.reset();
            this.notify();
        }
    }
};
