const clearSelection = () => {
  // clear the text selection
  const selection = window.getSelection();
  selection?.removeAllRanges();
};

export default clearSelection;
