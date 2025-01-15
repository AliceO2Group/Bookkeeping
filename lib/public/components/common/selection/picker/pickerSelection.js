import { h } from '/js/src/index.js';

/**
 * Displays the current picker selection as pills
 *
 * @param {SelectionModel} selectionModel the selection model
 * @param {Component} placeHolder placeholder used if selection is empty
 * @return {Component} the current selection
 */
export const pickerSelection = (selectionModel, placeHolder) => selectionModel.selectedOptions.length
    ? h(
        '.flex-row.flex-wrap.g2',
        selectionModel.selectedOptions.map(({ rawLabel, label, value }) => h(
            '',
            { key: rawLabel || label || value },
            label || value,
        )),
    )
    : placeHolder;
