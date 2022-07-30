// https://stackoverflow.com/a/10730777/10849036
const getAllNodes = (el: Element) => {
  var n,
    a = [],
    walk = document.createTreeWalker(el, -1, null);
  while ((n = walk.nextNode())) a.push(n);
  return a;
};

export default getAllNodes;
