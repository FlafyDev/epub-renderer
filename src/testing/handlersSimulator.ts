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
    (window as any).page("Text/Hina_-01.xhtml", Number(prompt("innerpage")));
  });

  createHandler("ready", (_, __, ___, consistentLocation) => {
    console.log(consistentLocation);
  });
};

export { createHandlers };
