// https://stackoverflow.com/a/66878952/10849036

const getNodes = (selection: Selection, childList: NodeListOf<ChildNode>) => {
  let nodes: Node[] = [];
  childList.forEach((node) => {
    const nodeSel = selection.containsNode(node, true);

    if (!nodeSel) return;

    const tempStr = node.nodeValue;

    if (node.nodeType === 3 && tempStr?.replace(/^\s+|\s+$/gm, "") !== "") {
      nodes.push(node);
    }

    if (node.nodeType === 1 && node.childNodes) {
      nodes = nodes.concat(getNodes(selection, node.childNodes));
    }
  });

  return nodes;
};

const highlightElements = (
  selection: Selection,
  className: string,
  allNodes: Node[][]
) => {
  const range = selection.getRangeAt(0);
  const {
    commonAncestorContainer,
    startContainer,
    endContainer,
    startOffset,
    endOffset,
  } = range;

  if (startContainer === endContainer) {
    const span = document.createElement("span");
    span.className = className;
    range.surroundContents(span);

    const nodeIndex = allNodes.findIndex((nodes) =>
      nodes.includes(startContainer)
    );

    const children = Array.from(startContainer.parentNode!.childNodes);
    const spanIndex = children.indexOf(span);

    console.log(children);
    console.log(spanIndex);

    let newParts = [];

    if (spanIndex != 0) {
      const prevSpan = children[spanIndex - 1];
      newParts.push(prevSpan);
    }

    if (spanIndex != children.length - 1) {
      const nextSpan = children[spanIndex + 1];
      newParts.push(nextSpan);
    }

    allNodes[nodeIndex] = newParts;

    return;
  }

  // get all possibles selected nodes
  const nodes = getNodes(selection, commonAncestorContainer.childNodes);

  console.log(nodes);

  nodes.forEach((node, index, listObj) => {
    const { nodeValue } = node;
    let text: string | null = null,
      prevText: string | null = null,
      nextText: string | null = null;

    if (nodeValue == null) {
      return;
    }

    if (index === 0) {
      prevText = nodeValue.substring(0, startOffset);
      text = nodeValue.substring(startOffset);
    } else if (index === listObj.length - 1) {
      text = nodeValue.substring(0, endOffset);
      nextText = nodeValue.substring(endOffset);
    } else {
      text = nodeValue;
    }

    const span = document.createElement("span");
    span.className = className;
    span.append(document.createTextNode(text));
    const { parentNode } = node;

    const nodeIndex = allNodes.findIndex((nodes) => nodes.includes(node));

    parentNode?.replaceChild(span, node);

    if (prevText) {
      const prevDOM = document.createTextNode(prevText);
      allNodes[nodeIndex] = [prevDOM];
      parentNode?.insertBefore(prevDOM, span);
    }

    if (nextText) {
      const nextDOM = document.createTextNode(nextText);
      allNodes[nodeIndex] = [nextDOM];
      parentNode?.insertBefore(nextDOM, span.nextSibling);
    }
  });
};

export default highlightElements;
