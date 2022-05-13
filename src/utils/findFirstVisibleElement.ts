import isElementVisible from "./isElementVisible";

const findFirstVisibleElement = async (
  parent: HTMLElement
): Promise<HTMLElement | null> => {
  for (const element of Array.from(parent.children) as HTMLElement[]) {
    if (await isElementVisible(element)) {
      return (await findFirstVisibleElement(element)) ?? element;
    }
  }

  return null;
};

export default findFirstVisibleElement;
