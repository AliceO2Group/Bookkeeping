import { h, info } from '/js/src/index.js';

/**
 * Error page component that will be displayed when an error occurs
 * @param {Model} errorModel - representing current application
 * @returns {Component} Error page component
 */
export const ErrorPage = (errorModel) =>
    h('div.flex-column.g2', [
        h('.flex-row.g2', [
            h('.flex-column', [
                h('h3', 'Error'),
                h('.f6', 'Error page'),
                h('button.btn.btn-primary', {
                    onclick: () => {
                        errorModel.router.go('?page=home');
                    } }, [
                    info(),
                    'Go to home Page',
                ]),
            ]),
        ]),
    ]);
