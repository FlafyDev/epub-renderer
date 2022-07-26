const textNodeGetBoundingClientRect = (
  textNode: Text,
  characterIndex: number | null = null,
  range: Range | null = null
) => {
  if (!range) {
    range = document.createRange();
  }

  if (characterIndex == null) {
    range.selectNodeContents(textNode);
  } else {
    range.setStart(textNode, characterIndex);
    range.setEnd(textNode, characterIndex + 1);
  }
  const rect = range.getBoundingClientRect();
  return rect;
};

export default textNodeGetBoundingClientRect;
