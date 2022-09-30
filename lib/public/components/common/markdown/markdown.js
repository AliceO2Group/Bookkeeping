/**
 * @license
 * Copyright CERN and copyright holders of ALICE O2. This software is
 * distributed under the terms of the GNU General Public License v3 (GPL
 * Version 3), copied verbatim in the file "COPYING".
 *
 * See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

import { h } from '/js/src/index.js';
import { markdownEngine } from './markdownEngine.js';

const DEFAULT_SIZE = 'auto';

/**
 * @typedef MarkdownBoxSize
 * @property {string} width the width of the markdown box
 * @property {string} height the height of the markdown box
 */

/**
 * Returns a markdown input component
 *
 * @param {string} content the initial content of the input
 * @param {Object} attributes the additional attributes to pass to the component, such as id and classes
 * @param {function} onEditorChange callback called any time the editor handler changes
 * @param {Partial<MarkdownBoxSize>} [size] the size of the markdown box
 * @return {vnode} the component
 */
export const markdownInput = (content, attributes, onEditorChange, size) => h(
    '.flex-grow',
    h(
        'textarea',
        {
            ...attributes,
            // eslint-disable-next-line require-jsdoc
            oncreate: function (node) {
                cleanCodeMirror(this.textarea);
                onEditorChange(markdownInputFromTextarea(
                    node.dom,
                    (value) => attributes.onchange({ target: { value } }),
                    size,
                ));
                this.textarea = node.dom;
            },
            // eslint-disable-next-line require-jsdoc
            onremove: function () {
                cleanCodeMirror(this.textarea);
                onEditorChange(null);
                this.textarea = null;
            },
        },
        content,
    ),
);

/**
 * Returns a markdown display component
 *
 * @param {string} content the markdown content
 * @param {Object} attributes the additional attributes to pass to the component, such as id and classes
 * @param {Partial<MarkdownBoxSize>} [size] the size of the markdown box
 * @return {vnode} the component
 */
export const markdownDisplay = (content, attributes, size) => h(
    'div',
    h(
        'textarea',
        {
            ...attributes,
            // eslint-disable-next-line require-jsdoc
            oncreate: function (node) {
                cleanCodeMirror(this.textarea);
                markdownFromTextarea(node.dom, true, size);
                this.textarea = node.dom;
            },
            // eslint-disable-next-line require-jsdoc
            onremove: function () {
                cleanCodeMirror(this.textarea);
                this.textarea = null;
            },
        },
        content,
    ),
);

/**
 * Extract a markdown editor form an existing textarea
 *
 * @param {HTMLTextAreaElement} textarea the textarea from which markdown component must be extracted
 * @param {function} onChange function called any time the markdown content changes
 * @param {Partial<MarkdownBoxSize>} size the size of the markdown input
 * @return {vnode} the component
 */
export const markdownInputFromTextarea = (textarea, onChange, size) => {
    const editor = markdownFromTextarea(textarea, false, size);

    editor.on('inputRead', (_cm, change) => {
        if (change.text.length === 1 && change.text[0] === ':') {
            editor.showHint();
        }
    });

    if (onChange) {
        editor.on('change', (cm) => onChange(cm.getValue()));
    }
    return editor;
};

/**
 * Remove any CodeMirror elements that may have not been handled well by mithril
 *
 * @param {HTMLElement} [node] the textarea dom node used to create codemirror editor
 * @return {void}
 */
const cleanCodeMirror = (node) => {
    if (node) {
        const sibling = node.nextElementSibling;
        if (sibling && sibling.classList.contains('CodeMirror')) {
            sibling.remove();
        }
    }
};

/**
 * Extract a markdown editor/display from an existing textarea
 *
 * @param {HTMLTextAreaElement} textarea the textarea from which markdown component must be extracted
 * @param {boolean} readOnly if true, returns a markdown display. Else, returns a markdown editor
 * @param {Partial<MarkdownBoxSize>} size the size of the markdown input
 * @return {vnode} the component
 */
const markdownFromTextarea = (textarea, readOnly, size) => {
    const { hyperMD, completeEmoji } = markdownEngine;
    const { width = DEFAULT_SIZE, height = DEFAULT_SIZE } = size || {};

    if (hyperMD === null || completeEmoji === null) {
        throw Error('HyperMD and CompleteEmoji needs to be enabled before using markdown tools');
    }

    const editor = hyperMD.fromTextArea(textarea, {
        hmdModeLoader: '/assets/SmartEditor/codemirror',
        readOnly,
        lineNumbers: !readOnly,
        extraKeys: {
            'Ctrl-Space': 'autocomplete',
        },
        hintOptions: {
            hint: completeEmoji.createHintFunc(),
        },
    });

    editor.setSize(width, height);

    return editor;
};
