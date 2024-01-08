import errorAlert from '../errorAlert.js';
import spinner from '../spinner.js';
import { h, iconCaretRight } from '/js/src/index.js';
import { iconCaretBottom } from '/js/src/icons.js';

/**
 * Display the node of a tree and its children
 *
 * @param {CollapsibleTreeNodeModel} nodeModel the model storing the node state
 * @param {function} valueDisplay function called with the node value to display the current node value
 * @param {function} childDisplay function called with each child (if node is not collapsed) to display node child
 * @return {vnode} the resulting node display
 */
export const collapsibleTreeNode = (nodeModel, valueDisplay, childDisplay) => h('.tree-node.flex-column.g2', [
    h('.flex-row.g2.items-center', { onclick: () => nodeModel.toggle() }, [
        h('small', nodeModel.isCollapsed ? iconCaretRight() : iconCaretBottom()),
        valueDisplay(nodeModel.value),
    ]),
    nodeModel.isCollapsed
        ? null
        : h('.tree-node-children.flex-column.g3', nodeModel.children.match({
            NotAsked: () => null,
            Loading: () => spinner(),
            Success: (children) => children.map((child) => h(
                '',
                { oncreate: (vnode) => vnode.dom.closest('.tree-node').scrollIntoView() },
                childDisplay(child),
            )),
            Failure: (errors) => errorAlert(errors),
        })),
]);
