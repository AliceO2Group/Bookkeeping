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

/**
 * A function to switch to HyperMD
 * @param {String} textAreaId The Id for the text area
 * @param {Object} model Pass the model object
 * @param {Object} changeHandler An object with 2 properties: location and name to get the setter methods via string
 * @param {Boolean} readOnly Defines wether the field should be read only or not
 * @param {Object} size The size of the box, in case the standard is too little or too big
 * @returns {vnode} The converted editor
 */
const setMarkDownBox = (textAreaId, model, changeHandler, readOnly, size) => {
    const { HyperMD, CompleteEmoji } = model;
    const { location = '', name = '' } = changeHandler;
    // eslint-disable-next-line no-undef
    const textArea = document.getElementById(textAreaId);
    if (textArea) {
        const editor = HyperMD.fromTextArea(textArea, {
            hmdModeLoader: '/assets/SmartEditor/codemirror',
            readOnly: readOnly ? 'nocursor' : false,
            lineNumbers: !readOnly,
            extraKeys: {
                'Ctrl-Space': 'autocomplete',
            },
            hintOptions: {
                hint: CompleteEmoji.createHintFunc(),
            },
        });

        editor.on('inputRead', (cm, change) => {
            if (change.text.length === 1 && change.text[0] === ':') {
                editor.showHint();
            }
        });

        editor.setSize(size.width, size.height);
        if (name && location) {
            editor.on('change', (cm) => model[location][name](cm.getValue()));
        }

        return editor;
    }
};

export { setMarkDownBox };
