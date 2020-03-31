import { h } from "/js/src/index.js";
import { iconPerson } from '/js/src/icons.js';

/**
 * Top header of the page
 * @param {object} model
 * @param {pages}
 * @return {vnode}
 */
const navBar = (model, pages) =>
    h('.flex-row.justify-between.items-center.ph4.pv2.shadow-level2.level2.bg-gray-light', [
        h('.flex-column.items-center', [
            h('img', {
            style: 'width: 40px',
            src: './assets/alice.png'
            }),
            h('.f6', 'Logbook')
        ]),
        h('btn-group', Object.keys(pages).map(tab => {
            return h(`button.btn.btn-tab ${model.router.params.page === tab ? 'selected' : ''}`, {
            onclick: () => model.router.go(`?page=${tab}`)
            }, tab[0].toUpperCase() + tab.slice(1))
        })),
        h('button.btn.h3', iconPerson()),
        ]);

export default navBar;
