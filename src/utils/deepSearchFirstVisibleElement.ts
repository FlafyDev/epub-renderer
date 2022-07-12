import findFirstVisibleElement from "./findFirstVisibleElement";

const deepSearchFirstVisibleElement = async (
  parent: HTMLElement
): Promise<HTMLElement> => {
  const firstVisibleElement = await findFirstVisibleElement(
    Array.from(parent.children) as HTMLElement[]
  );
  if (firstVisibleElement) {
    return await deepSearchFirstVisibleElement(firstVisibleElement);
  }

  return parent;
};

export default deepSearchFirstVisibleElement;
