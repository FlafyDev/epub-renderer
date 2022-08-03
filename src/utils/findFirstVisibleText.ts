import getAllTextNodes from "./getAllTextNodes";
import percentInView from "./percentInView";
import nodeGetBoundingClientRect from "./nodeGetBoundingClientRect";

const findFirstVisibleText = (parent: Element): [Text, number] | null => {
  const range = document.createRange();
  const textNodes = getAllTextNodes(parent);
  for (let i = 0; i < textNodes.length; i++) {
    const textNode = textNodes[i];
    if (percentInView(nodeGetBoundingClientRect(textNode, null, range)) > 0) {
      const characters = textNode.length;
      for (let j = 0; j < characters - 1; j++) {
        const rect = nodeGetBoundingClientRect(textNode, j, range);
        if (percentInView(rect) > 0) {
          return [textNode, Math.max(0, j)];
        }
      }

      return [textNode, 0];
    }
  }

  return null;
};

export default findFirstVisibleText;
