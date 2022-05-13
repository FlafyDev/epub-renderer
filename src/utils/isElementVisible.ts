const isElementVisible = async (elem: Element) => {
  return new Promise((resolve) => {
    const o = new IntersectionObserver(([entry]) => {
      resolve(entry.intersectionRatio > 0);
      o.disconnect();
    });
    o.observe(elem);
  });
};

export default isElementVisible;
