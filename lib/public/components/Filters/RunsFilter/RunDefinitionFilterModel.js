import { RUN_DEFINITIONS, RunDefinition } from '../../../domain/enums/RunDefinition.js';
import { SelectionFilterModel } from '../common/filters/SelectionFilterModel.js';

/**
 * Run definition filter model
 */
export class RunDefinitionFilterModel extends SelectionFilterModel {
    /**
     * Constructor
     */
    constructor() {
        super({ availableOptions: RUN_DEFINITIONS.map((definition) => ({ value: definition })) });
    }

    /**
     * Returns true if the current filter is physics only
     *
     * @return {boolean} true if filter is physics only
     */
    isPhysicsOnly() {
        const selectedOptions = this._selectionModel.selected;
        return selectedOptions.length === 1 && selectedOptions[0] === RunDefinition.Physics;
    }

    /**
     * Sets the current filter to physics only
     *
     * @return {void}
     */
    setPhysicsOnly() {
        if (!this.isPhysicsOnly()) {
            this._selectionModel.selectedOptions = [];
            this._selectionModel.select(RunDefinition.Physics);
            this.notify();
        }
    }

    /**
     * Empty the current filter
     *
     * @return {void}
     */
    setEmpty() {
        if (!this.isEmpty) {
            this.reset();
            this.notify();
        }
    }
}
