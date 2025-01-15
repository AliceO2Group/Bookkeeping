/**
 * Return a subset of options for which label/value matches a given search text
 *
 * @param {SelectionOption[]} options options the list of options to filter
 * @param {string} substring the substring that options must match
 * @return {SelectionOption[]} the filtered options
 */
export const filterSelectionOptions = (options, substring) => {
    /**
     * Apply the current search filtering on option
     *
     * @param {SelectionOption} option the option to filter
     * @return {boolean} true if the option matches the current search
     */
    const filter = substring
        ? ({ rawLabel, label, value }) => (rawLabel || label || value).toUpperCase().includes(substring.toUpperCase())
        : null;

    return filter ? options.filter(filter) : options;
};
