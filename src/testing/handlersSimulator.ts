import NoteData, { NoteRangeData } from "../models/noteData";

const handlers = new Map<String, (...args: any[]) => void>();

const createHandler = (name: string, body: (...args: any[]) => void) => {
  if ((window as any).flutter_inappwebview === undefined) {
    (window as any).flutter_inappwebview = {
      callHandler: (name: string, ...args: any[]) => {
        return handlers.get(name)?.(...args);
      },
    };
  }

  handlers.set(name, body);
};

const createHandlers = () => {
  createHandler("load", () => {
    (window as any).page("xhtml/epub30-titlepage.xhtml", 0, null, [
      new NoteData([new NoteRangeData(23, 6, 23, 15)], "yellow"),
    ]);
  });

  createHandler("selection", (text: string, ranges: NoteRangeData[]) => {
    console.log(text);
    console.log(ranges);
  });

  createHandler("ready", (_, __, ___, consistentLocation) => {
    console.log(consistentLocation);
  });
};

export { createHandlers };
