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
  callback: (
    pageFilePath: string,
    innerPage: InnerPage,
    forced: boolean
  ) => void
) => {
  (window as any).page = (
    pageFilePath: string,
    innerPage?: number,
    forced: boolean = false
  ) => callback(pageFilePath, new InnerPage(innerPage ?? 0), forced);
};

export const onPageAnchor = (
  callback: (
    pageFilePath: string,
    innerAnchor: InnerAnchor,
    forced: boolean
  ) => void
) => {
  (window as any).pageAnchor = (
    pageFilePath: string,
    anchor: string,
    forced: boolean = false
  ) => callback(pageFilePath, new InnerAnchor(anchor), forced);
};

export const onPageElement = (
  callback: (
    pageFilePath: string,
    innerElement: InnerElement,
    forced: boolean
  ) => void
) => {
  (window as any).pageElement = (
    pageFilePath: string,
    elementIndex: number,
    forced: boolean = false
  ) => callback(pageFilePath, new InnerElement(elementIndex), forced);
};

export const onPageTextNode = (
  callback: (
    pageFilePath: string,
    innerTextNode: InnerTextNode,
    forced: boolean
  ) => void
) => {
  (window as any).pageTextNode = (
    pageFilePath: string,
    textNodeIndex: number,
    characterIndex: number,
    forced: boolean = false
  ) =>
    callback(
      pageFilePath,
      new InnerTextNode(textNodeIndex, characterIndex),
      forced
    );
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
