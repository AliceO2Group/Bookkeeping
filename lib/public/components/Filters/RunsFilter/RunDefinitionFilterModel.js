import { RUN_DEFINITIONS, RunDefinition } from '../../../domain/enums/RunDefinition.js';
import { SelectionModel } from '../../common/selection/SelectionModel.js';

/**
 * Run definition filter model
 */
export class RunDefinitionFilterModel extends SelectionModel {
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
        const selectedOptions = this.selected;
        return selectedOptions.length === 1 && selectedOptions[0] === RunDefinition.Physics;
    }

    /**
     * Sets the current filter to physics only
     *
     * @return {void}
     */
    setPhysicsOnly() {
        if (!this.isPhysicsOnly()) {
            this.selectedOptions = [];
            this.select(RunDefinition.Physics);
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
