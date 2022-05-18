const findFirstVisibleElement = async (elements: HTMLElement[]) => {
  return (
    (elements.length > 0 &&
      new Promise<HTMLElement | null>((resolve) => {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.intersectionRatio > 0) {
              resolve(entry.target as HTMLElement);
              observer.disconnect();
            }
          });
          resolve(null);
        });

        elements.forEach((element) => {
          observer.observe(element);
        });
      })) ||
    null
  );
};

export default findFirstVisibleElement;
