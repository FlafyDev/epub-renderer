// let currentPage = 10;

// const methods: { [method: string]: (message: { message: string }) => void } = {
//   getPages: ({ message }) => {
//     const pages = message.split(",").map((elem) => parseInt(elem));
//     for (let i = 0; i < pages.length; i++) {
//       let content = "";
//       for (let j = 0; j < 500; j++) {
//         content += `<div>Page ${pages[i]} -- ${j}</div>`;
//       }
//       (window as any).pageData(pages[i], content);
//     }
//   },
//   loaded: (arg) => {
//     (window as any).setLocation(currentPage, "");
//   },
//   nextPage: (arg) => {
//     (window as any).setLocation(++currentPage, "");
//   },
//   previousPage: (arg) => {
//     (window as any).setLocation(--currentPage, "end");
//   },
//   updateLocation: (arg) => {
//     currentPage = parseInt(arg.message.split(",").at(0)!);
//   },
// };

// Object.keys(methods).forEach((methodName) => {
//   (window as any)[methodName] = {
//     postMessage: (message: string) => methods[methodName]({ message: message }),
//   };
// });

const callChannel = (name: string, message?: string) => {
  // console.log(`${name}: "${message}"`);
  return (window as any)[name].postMessage(message) as void;
};

// From Flutter app
export const onSetLocation = (
  callback: (index: number, selector: string) => void
) => {
  (window as any).setLocation = callback;
};

export const onPageData = (callback: (index: number, html: string) => void) => {
  (window as any).pageData = callback;
};

export const onMoveInnerPage = (callback: (offset: number) => void) => {
  (window as any).moveInnerPage = callback;
};

export const onRequestScreenshot = (callback: () => void) => {
  (window as any).requestScreenshot = callback;
};

// To Flutter app
export const requestNextPage = () => {
  callChannel("nextPage");
};

export const requestPreviousPage = () => {
  callChannel("previousPage");
};

export const requestPages = (pages: number[]) => {
  callChannel("getPages", pages.join(","));
};

export const notifyLoaded = () => {
  callChannel("loaded");
};

// TODO use this
// export const updateLocation = (pageIndex: number, elementSelector: string) => {
//   callChannel("updateLocation", `${pageIndex},${elementSelector}`);
// };
