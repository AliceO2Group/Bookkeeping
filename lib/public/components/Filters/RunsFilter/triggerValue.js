import { checkboxFilter } from '../common/checkboxFilter.js';

const TRIGGER_VALUES = ['OFF', 'LTU', 'CTP'];

/**
 * Returns a panel to be used by user to filter runs by quality
 * @param {Object} model The global model object
 * @return {vnode} A text box that allows the user to enter a title substring to match against all logs
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
