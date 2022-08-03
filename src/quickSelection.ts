class QuickSelection {
  enabled = false;

  constructor() {}

  toggle = (enable: boolean) => {
    if (enable) {
      if (!this.enabled) {
        this.enabled = true;
        document.addEventListener("click", this._onClick, true);
      }
    } else {
      if (this.enabled) {
        this.enabled = false;
        document.removeEventListener("click", this._onClick, true);
      }
    }
  };

  _onClick = () => {
    try {
      // https://stackoverflow.com/a/41345185/10849036
      const selection = window.getSelection();
      if (!selection || selection.rangeCount != 1) return;
      const range = selection.getRangeAt(0);

      if (range.toString() !== "") return;

      const node = selection.anchorNode as Node;

      if (!node) return;

      const word_regexp = /^\w*$/;

      // Extend the range backward until it matches word beginning
      while (range.startOffset > 0 && range.toString().match(word_regexp)) {
        range.setStart(node, range.startOffset - 1);
      }

      // Restore the valid word match after overshooting
      if (!range.toString().match(word_regexp)) {
        range.setStart(node, range.startOffset + 1);
      }

      // Extend the range forward until it matches word ending
      while (
        // @ts-ignore
        range.endOffset < node.length &&
        range.toString().match(word_regexp)
      ) {
        range.setEnd(node, range.endOffset + 1);
      }
      // Restore the valid word match after overshooting
      if (!range.toString().match(word_regexp)) {
        range.setEnd(node, range.endOffset - 1);
      }
    } catch (e) {
      console.error(`QuickSelection: ${e}`);
    }
  };
}

export default QuickSelection;
