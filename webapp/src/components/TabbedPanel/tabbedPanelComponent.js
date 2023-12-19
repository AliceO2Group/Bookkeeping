import { h, switchCase } from '@aliceo2/web-ui-frontend';
import { tabLink } from '../common/navigation/tabLink.js';

/**
 * Returns a component to display a tabbed panel
 *
 * @param {TabbedPanelModel}  tabbedPanelModel the tabbed panel model
 * @param {Object<string, string>} panelsTitles map between the panels keys and the corresponding title
 * @param {Object<string, function>} panelsBodies map between the panels keys and a function taking the panel data as parameter and providing the
 *     panel body in return
 * @param {Object} [configuration] the tabbed panel configuration
 * @param {string|string[]} [configuration.panelClass='p2'] class applied to the active pane (if several, use an array)
 * @return {Component} the tabbed panel component
 */
export const tabbedPanelComponent = (tabbedPanelModel, panelsTitles, panelsBodies, configuration) => {
    const { panelClass = 'p2' } = configuration || {};

    return [
        h(
            'ul.nav.nav-tabs',
            Object.entries(panelsTitles).map(([key, title]) => h(
                'li.nav-item',
                tabLink(title, { panel: key }, { id: `${key}-tab` }, key === tabbedPanelModel.defaultPanelKey),
            )),
        ),
        h(
            `.${(Array.isArray(panelClass) ? panelClass : [panelClass]).join('.')}`,
            { id: `${tabbedPanelModel.currentPanelKey}-pane` },
            switchCase(
                tabbedPanelModel.currentPanelKey,
                panelsBodies,
                () => null,
            )(tabbedPanelModel.currentPanelData),
        ),
    ];
};
