import { h } from '/js/src/index.js';

/**
 * Returns a table row to use to indicate that no data is available
 *
 * @param {number} colspan the amount of columns the row must span on
 * @return {Component} the no-data row
 */
export const noDataRow = (colspan) => h('tr', h('td', { colSpan: colspan }, h('.text-center', h('em', 'No data'))));
