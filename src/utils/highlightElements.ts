// https://stackoverflow.com/a/66878952/10849036

import { OriginalNodeData } from "../components/page";
import insert from "./insert";

export const getNodes = (
  selection: Selection,
  childList: NodeListOf<ChildNode>
) => {
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
  originalNodesData: OriginalNodeData[]
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

    const ogNodeIndex = originalNodesData.findIndex((ogData) =>
      ogData.parts.some((part) => part.node === startContainer)
    );

    const ogNodePartIndex = originalNodesData[ogNodeIndex].parts.findIndex(
      (part) => part.node === startContainer
    );

    range.surroundContents(span);

    const children = Array.from(startContainer.parentNode!.childNodes);
    const spanIndex = children.indexOf(span);

    let newOgNodeData: OriginalNodeData = new OriginalNodeData([]);

    if (spanIndex != 0) {
      const prevSpan = children[spanIndex - 1];
      newOgNodeData.parts.push({
        node: prevSpan,
        preLength:
          originalNodesData[ogNodeIndex].parts[ogNodePartIndex].preLength,
      });
    }

    if (spanIndex != children.length - 1) {
      const nextSpan = children[spanIndex + 1];
      newOgNodeData.parts.push({
        node: nextSpan,
        preLength: span.textContent?.length ?? 0,
      });
    }

    originalNodesData[ogNodeIndex].parts.splice(ogNodePartIndex, 1);
    originalNodesData[ogNodeIndex].parts = insert(
      originalNodesData[ogNodeIndex].parts,
      ogNodePartIndex,
      ...newOgNodeData.parts
    );

    return;
  }

  const nodes = getNodes(selection, commonAncestorContainer.childNodes);

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

    const ogNodeIndex = originalNodesData.findIndex((ogData) =>
      ogData.parts.some((part) => part.node === node)
    );

    const ogNodePartIndex = originalNodesData[ogNodeIndex].parts.findIndex(
      (part) => part.node === node
    );

    const preLength =
      originalNodesData[ogNodeIndex].parts[ogNodePartIndex].preLength;

    originalNodesData[ogNodeIndex].parts.splice(ogNodePartIndex, 1);

    parentNode?.replaceChild(span, node);

    if (prevText) {
      const prevDOM = document.createTextNode(prevText);
      parentNode?.insertBefore(prevDOM, span);

      originalNodesData[ogNodeIndex].parts = insert(
        originalNodesData[ogNodeIndex].parts,
        ogNodePartIndex,
        {
          node: prevDOM,
          preLength: preLength,
        }
      );
    } else if (nextText) {
      const nextDOM = document.createTextNode(nextText);
      parentNode?.insertBefore(nextDOM, span.nextSibling);
      originalNodesData[ogNodeIndex].parts = insert(
        originalNodesData[ogNodeIndex].parts,
        ogNodePartIndex,
        {
          node: nextDOM,
          preLength: preLength,
        }
      );
    }
  });
};

export default highlightElements;
