import { getNodes } from "./highlightElements";

const getNodesFromSelection = (selection: Selection) => {
  if (selection.rangeCount <= 0) return [];

  const range = selection.getRangeAt(0);
  const { commonAncestorContainer, startContainer, endContainer } = range;

  return startContainer == endContainer
    ? [startContainer]
    : getNodes(selection, commonAncestorContainer.childNodes);
};

export default getNodesFromSelection;
