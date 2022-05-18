import findFirstVisibleElement from "./findFirstVisibleElement";

// const findFirstVisibleElement = async (
//   parent: HTMLElement
// ): Promise<HTMLElement | null> => {
//   const firstVisibleElement = await getFirstVisibleElement(parent);
//   if (firstVisibleElement) {
//     return await findFirstVisibleElement(firstVisibleElement);
//   }

//   return parent;
// };

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
