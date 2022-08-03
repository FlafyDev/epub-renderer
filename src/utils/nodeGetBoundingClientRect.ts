const nodeGetBoundingClientRect = (
  node: Node,
  characterIndex: number | null = null,
  range: Range | null = null
) => {
  if (!range) {
    range = document.createRange();
  }

  if (characterIndex == null) {
    range.selectNodeContents(node);
  } else {
    range.setStart(node, characterIndex);
    range.setEnd(
      node,
      Math.min(characterIndex + 1, node.textContent?.length ?? 0)
    );
  }
  const rect = range.getBoundingClientRect();
  return rect;
};

export default nodeGetBoundingClientRect;
