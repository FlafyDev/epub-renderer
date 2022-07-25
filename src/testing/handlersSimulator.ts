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
    // (window as any).css("* { color: white !important; }");
    (window as any).pageGoAnchor("xhtml/epub30-mediaoverlays.xhtml", "");
  });

  // let tests = 0;

  // createHandler("ready", (_, __, c) => {});
};

export { createHandlers };
