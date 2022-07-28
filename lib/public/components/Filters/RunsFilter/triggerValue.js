import { checkboxFilter } from '../common/checkboxFilter.js';

const TRIGGER_VALUES = ['OFF', 'LTU', 'CTP'];

/**
 * Returns a panel to be used by user to filter runs by trigger value
 * @param {Object} model The global model object
 * @return {vnode} Multiple checkboxes for a user to select the values to be filtered.
 */
const triggerValue = (model) => checkboxFilter(
    'triggerValue',
    TRIGGER_VALUES,
    (value) => model.runs.triggerValuesFilters.has(value),
    (e, value) => {
        if (e.target.checked) {
            model.runs.triggerValuesFilters.add(value);
        } else {
            model.runs.triggerValuesFilters.delete(value);
        }
        model.runs.triggerValuesFilters = Array.from(model.runs.triggerValuesFilters);
    },
);

export default triggerValue;
