import { StyleProperties } from "./components/page";
import InnerLocation, {
  InnerAnchor,
  InnerElement,
  InnerPage,
  InnerTextNode,
} from "./models/innerLocation";
import NoteData, { NoteRangeData } from "./models/noteData";

const callHandler = (name: string, ...args: any[]) => {
  // console.log(`${name}: "${message}"`);
  return (window as any).flutter_inappwebview.callHandler(name, ...args);
};

// From Controller
export const onPage = (
  callback: (
    pageFilePath: string,
    innerPage: InnerPage,
    forced: boolean,
    notesData: NoteData[]
  ) => void
) => {
  (window as any).page = (
    pageFilePath: string,
    innerPage?: number,
    forced?: boolean,
    notesData?: NoteData[]
  ) =>
    callback(
      pageFilePath,
      new InnerPage(innerPage ?? 0),
      forced ?? false,
      notesData ?? []
    );
};

export const onPageAnchor = (
  callback: (
    pageFilePath: string,
    innerAnchor: InnerAnchor,
    forced: boolean,
    notesData: NoteData[]
  ) => void
) => {
  (window as any).pageAnchor = (
    pageFilePath: string,
    anchor: string,
    forced: boolean = false,
    notesData?: NoteData[]
  ) => callback(pageFilePath, new InnerAnchor(anchor), forced, notesData ?? []);
};

export const onPageElement = (
  callback: (
    pageFilePath: string,
    innerElement: InnerElement,
    forced: boolean,
    notesData: NoteData[]
  ) => void
) => {
  (window as any).pageElement = (
    pageFilePath: string,
    elementIndex: number,
    forced: boolean = false,
    notesData?: NoteData[]
  ) =>
    callback(
      pageFilePath,
      new InnerElement(elementIndex),
      forced,
      notesData ?? []
    );
};

export const onPageTextNode = (
  callback: (
    pageFilePath: string,
    innerTextNode: InnerTextNode,
    forced: boolean,
    notesData: NoteData[]
  ) => void
) => {
  (window as any).pageTextNode = (
    pageFilePath: string,
    textNodeIndex: number,
    characterIndex: number,
    forced: boolean = false,
    notesData?: NoteData[]
  ) =>
    callback(
      pageFilePath,
      new InnerTextNode(textNodeIndex, characterIndex),
      forced,
      notesData ?? []
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

export const notifyNotePress = (nodeId: string) => {
  callHandler("notePress", nodeId);
};

export const notifySelection = (
  selection: string,
  notesRangeData: NoteRangeData[] | null,
  box: DOMRect
) => {
  callHandler(
    "selection",
    selection,
    notesRangeData,
    Math.floor(box.left),
    Math.floor(box.top),
    Math.floor(box.width),
    Math.floor(box.height)
  );
};

export const notifyLink = (link: string) => {
  callHandler("link", link);
};
