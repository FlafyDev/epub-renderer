import getAllTextNodes from "./getAllTextNodes";
import percentInView from "./percentInView";
import textNodeGetBoundingClientRect from "./textNodeGetBoundingClientRect";

const findFirstVisibleText = (parent: Element): [Text, number] | null => {
  const range = document.createRange();
  const textNodes = getAllTextNodes(parent);
  for (let i = 0; i < textNodes.length; i++) {
    const textNode = textNodes[i];
    if (
      percentInView(textNodeGetBoundingClientRect(textNode, null, range)) > 0
    ) {
      const characters = textNode.length;
      console.log(characters);
      for (let j = 0; j < characters - 1; j++) {
        const rect = textNodeGetBoundingClientRect(textNode, j, range);
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
