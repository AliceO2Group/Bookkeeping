import { h, iconHome } from '/js/src/index.js';

/**
 * Error page component that will be displayed when an error occurs
 * @param {Model} model - representing current application
 * @returns {Component} Error page component
 */
export const ErrorPage = (model) =>
    h('div.flex-column.justify-center ', [
        h('.flex-column.items-center.g3.mv4', [
            h('img', {
                src: 'assets/alice.png',
                alt: 'Alice logo',
                style: 'width: 200px',
            }),
            h('h2', 'Oops! Something went wrong.'),
            h('h3', '404 - Page not found'),
            h('.f5', 'The page you are looking for might have been removed, had its name changed or is temporarily unavailable.'),
            h('button.btn.btn-primary', {
                onclick: () => {
                    model.router.go('?page=home');
                } }, [
                iconHome(),
                ' Go to home Page',
            ]),
        ]),
    ]);
