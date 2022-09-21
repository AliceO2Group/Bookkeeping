import { checkboxFilter } from '../common/filters/checkboxFilter.js';

const TRIGGER_VALUES = ['OFF', 'LTU', 'CTP'];

/**
 * Returns a panel to be used by user to filter runs by trigger value
 * @param {RunModel} runModel The global model object
 * @return {vnode} Multiple checkboxes for a user to select the values to be filtered.
 */
const triggerValue = (runModel) => checkboxFilter(
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

export default triggerValue;
