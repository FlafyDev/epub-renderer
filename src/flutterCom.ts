// let currentPage = 10;

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
export const onPage = (callback: (innerPage: number, html: string) => void) => {
  (window as any).page = callback;
};

// To Flutter app
export const notifyLoaded = () => {
  callChannel("loaded");
};

export const notifyReady = (innerPage: number, innerPages: number) => {
  callChannel("ready", `${innerPage},${innerPages}`);
};

// TODO use this
// export const updateLocation = (pageIndex: number, elementSelector: string) => {
//   callChannel("updateLocation", `${pageIndex},${elementSelector}`);
// };
