// let currentPage = 10;

import { StyleProperties } from "./components/page";

// const methods: { [method: string]: (message: { message: string }) => void } = {
//   getPages: ({ message }) => {
//     const pages = message.split(",").map((elem) => parseInt(elem));
//     for (let i = 0; i < pages.length; i++) {
//       let content = "";
//       for (let j = 0; j < 1000 + pages[i]; j++) {
//         content += `<div>Page ${pages[i]} --------------------------------------- ${j}</div>`;
//       }
//       (window as any).pageData(pages[i], content);
//     }
//   },
//   loaded: (arg) => {
//     (window as any).page(currentPage, "");
//   },
//   ready: (arg) => {

//   }
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
export const onPage = (
  callback: (pageFilePath: string, innerPage: number) => void
) => {
  (window as any).page = callback;
};

export const onStyle = (callback: (style: StyleProperties) => void) => {
  (window as any).style = callback;
};

export const onCSS = (callback: (css: string) => void) => {
  (window as any).css = callback;
};

export const onData = (callback: (baseUrl: string) => void) => {
  (window as any).data = callback;
};

// To Flutter app
export const notifyLoaded = () => {
  callChannel("loaded");
};

export const notifyReady = (innerPage: number, innerPages: number) => {
  callChannel("ready", `${innerPage},${innerPages}`);
};

export const notifySelection = (selection: string, box: DOMRect) => {
  callChannel(
    "selection",
    `${selection},${Math.floor(box.left)},${Math.floor(box.top)},${Math.floor(
      box.width
    )},${Math.floor(box.height)}`
  );
};

// TODO use this
// export const updateLocation = (pageIndex: number, elementSelector: string) => {
//   callChannel("updateLocation", `${pageIndex},${elementSelector}`);
// };
