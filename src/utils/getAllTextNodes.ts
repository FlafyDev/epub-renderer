// https://stackoverflow.com/a/10730777/10849036
const getAllTextNodes = (el: Element) => {
  var n,
    a = [],
    walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
  while ((n = walk.nextNode())) a.push(n);
  return a as Text[];
};

export default getAllTextNodes;
