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

// shuffle array
// const shuffle = (array: NoteData[]) => {
//   for (let i = array.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [array[i], array[j]] = [array[j], array[i]];
//   }
//   console.log(array.map((note) => note.id));
//   return array;
// };

const createHandlers = () => {
  createHandler("load", () => {
    (window as any).page("xhtml/epub30-titlepage.xhtml", 0, null, [
      new NoteData("Adas3", [new NoteRangeData(23, 23, 23, 46)], 2, true),
      new NoteData("Adas1", [new NoteRangeData(23, 14, 23, 17)], 0, true),
      new NoteData("Adas5", [new NoteRangeData(23, 190, 28, 55)], 3, true),
      new NoteData("Adas4", [new NoteRangeData(23, 46, 23, 100)], 3, true),
      new NoteData("Adas2", [new NoteRangeData(23, 17, 23, 23)], 1, true),
    ]);
  });

  createHandler("notePress", (nodeId: string) => {
    console.log(`node: ${nodeId}`);
  });

  createHandler("selection", (text: string, ranges: NoteRangeData[]) => {
    console.log(`selection: ${text}`);
    console.log(ranges);
  });

  createHandler("ready", (_, __, ___, consistentLocation) => {
    console.log(consistentLocation);
  });
};

export { createHandlers };
