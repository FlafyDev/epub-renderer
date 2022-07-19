const handlers = new Map<String, Function>();

const createHandler = (name: string, body: Function) => {
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
  createHandler("loaded", () => {
    (window as any).data("http://localhost:8081/");
    (window as any).css("* { color: white !important; }");
    (window as any).page("xhtml/epub30-overview.xhtml", 0);
  });

  let tested = false;

  createHandler("ready", () => {
    if (tested) {
      console.log("READY!");
      return;
    }

    tested = true;
    (window as any).pageGoAnchor(
      "xhtml/epub30-publications.xhtml",
      "sec-metadata-assoc"
    );
  });
};

export { createHandlers };
