const defaultSize = { width: '80rem', height: '40rem' };

/**
 * A function to switch to HyperMD
 * @param {String} textAreaId The Id for the text area
 * @param {Object} model Pass the model object
 * @param {Object} changeHandler An object with 2 properties: location and name to get the setter methods via string
 * @param {Boolean} readOnly Defines wether the field should be read only or not
 * @param {Object} size The size of the box, in case the standard is too little or too big
 * @returns {vnode} The converted editor
 */
const setMarkDownBox = (textAreaId, model,
    changeHandler = { location: '', name: '' }, readOnly = false, size = { ...defaultSize }) => {
    const { HyperMD } = model;
    const { location, name } = changeHandler;
    // eslint-disable-next-line no-undef
    const textArea = document.getElementById(textAreaId);
    const editor = HyperMD.fromTextArea(textArea, {
        hmdModeLoader: '../../assets/SmartEditor/codemirror',
        readOnly: readOnly,
    });
    editor.setSize(size.width, size.height);
    if (name && location) {
        editor.on('change', (cm) =>
            model[location][name](cm.getValue()));
    }
    return editor;
};

export { setMarkDownBox };
