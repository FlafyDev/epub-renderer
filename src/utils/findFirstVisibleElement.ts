import percentInView from "./percentInView";

const findFirstVisibleElement = (parent: Element): Element => {
  const children = parent.children;
  for (let i = 0; i < children.length; i++) {
    if (percentInView(children[i].getBoundingClientRect()) > 0) {
      return findFirstVisibleElement(children[i]);
    }
  }

  return parent;
};

export default findFirstVisibleElement;
