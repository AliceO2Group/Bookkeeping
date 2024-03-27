import { checkboxFilter } from '../common/filters/checkboxFilter.js';
import { TRIGGER_VALUES } from '../../../domain/enums/TriggerValue.js';

/**
 * Returns a panel to be used by user to filter runs by trigger value
 * @param {RunsOverviewModel} runModel The global model object
 * @return {vnode} Multiple checkboxes for a user to select the values to be filtered.
 */
export const triggerValueFilter = (runModel) => checkboxFilter(
    'triggerValue',
    TRIGGER_VALUES,
    (value) => runModel.triggerValuesFilters.has(value),
    (e, value) => {
        if (e.target.checked) {
            runModel.triggerValuesFilters.add(value);
        } else {
            runModel.triggerValuesFilters.delete(value);
        }
        runModel.triggerValuesFilters = Array.from(runModel.triggerValuesFilters);
    },
);
