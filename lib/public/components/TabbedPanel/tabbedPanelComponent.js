import { h, switchCase } from '/js/src/index.js';
import { tabLink } from '../common/navigation/tabLink.js';

/**
 * Returns a component to display a tabbed panel
 *
 * @param {TabbedPanelModel}  tabbedPanelModel the tabbed panel model
 * @param {Object<string, string>} panelsTitles map between the panels keys and the corresponding title
 * @param {Object<string, function>} panelsBodies map between the panels keys and a function taking the panel data as parameter and providing the
 *     panel body in return
 * @return {Component} the tabbed panel component
 */
export const tabbedPanelComponent = (tabbedPanelModel, panelsTitles, panelsBodies) => [
    h(
        'ul.nav.nav-tabs',
        Object.entries(panelsTitles).map(([key, title]) => h(
            'li.nav-item',
            tabLink(title, { panel: key }, { id: `${key}-tab` }, key === tabbedPanelModel.defaultPanelKey),
        )),
    ),
    h(
        '.tab-content.p2',
        h(
            '.tab-pane.active',
            { id: `${tabbedPanelModel.currentPanelKey}-pane` },
            switchCase(
                tabbedPanelModel.currentPanelKey,
                panelsBodies,
                () => null,
            )(tabbedPanelModel.currentPanelData),
        ),
    ),
];
