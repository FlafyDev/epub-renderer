const flutterCallback = (name: string, ...args: any) =>
  (window as any).flutterCallback(name, ...args);

// const onNextPage = () => {};

// const onPrevPage = () => {

// }

export const onPageHtml = (callback: (html: string) => void) => {
  (window as any).setPageHtml = callback;
};

export const onMoveInnerPage = (callback: (previous: boolean) => void) => {
  (window as any).moveInnerPage = callback;
};

export const requestNextPage = () => {
  flutterCallback("nextPage");
};

export const requestPreviousPage = () => {
  flutterCallback("previousPage");
};
