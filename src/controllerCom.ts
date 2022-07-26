import { StyleProperties } from "./components/page";
import InnerLocation, {
  InnerAnchor,
  InnerElement,
  InnerPage,
  InnerTextNode,
} from "./models/innerLocation";

const callHandler = (name: string, ...args: any[]) => {
  // console.log(`${name}: "${message}"`);
  return (window as any).flutter_inappwebview.callHandler(name, ...args);
};

// From Controller
export const onPage = (
  callback: (pageFilePath: string, innerPage: InnerPage) => void
) => {
  (window as any).page = (pageFilePath: string, innerPage?: number) =>
    callback(pageFilePath, new InnerPage(innerPage ?? 0));
};

export const onPageAnchor = (
  callback: (pageFilePath: string, innerAnchor: InnerAnchor) => void
) => {
  (window as any).pageAnchor = (pageFilePath: string, anchor: string) =>
    callback(pageFilePath, new InnerAnchor(anchor));
};

export const onPageElement = (
  callback: (pageFilePath: string, innerElement: InnerElement) => void
) => {
  (window as any).pageElement = (pageFilePath: string, elementIndex: number) =>
    callback(pageFilePath, new InnerElement(elementIndex));
};

export const onPageTextNode = (
  callback: (pageFilePath: string, innerTextNode: InnerTextNode) => void
) => {
  (window as any).pageTextNode = (
    pageFilePath: string,
    textNodeIndex: number,
    characterIndex: number
  ) => callback(pageFilePath, new InnerTextNode(textNodeIndex, characterIndex));
};

export const onStyle = (callback: (style: StyleProperties) => void) => {
  (window as any).style = callback;
};

export const onCSS = (callback: (css: string) => void) => {
  (window as any).css = callback;
};

export const onClearSelection = (callback: () => void) => {
  (window as any).clearSelection = callback;
};

// To Controller
export const notifyLoad = () => {
  callHandler("load");
};

export const notifyReady = (
  innerPage: number,
  innerPages: number,
  passedAnchors: String[],
  consistentInnerLocation: InnerLocation
) => {
  callHandler(
    "ready",
    innerPage,
    innerPages,
    passedAnchors,
    consistentInnerLocation
  );
};

export const notifySelection = (selection: string, box: DOMRect) => {
  callHandler(
    "selection",
    selection,
    Math.floor(box.left),
    Math.floor(box.top),
    Math.floor(box.width),
    Math.floor(box.height)
  );
};

export const notifyLink = (link: string) => {
  callHandler("link", link);
};
