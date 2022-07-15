const createChannel = (name: string, body: Function) => {
  (window as any)[name] = { postMessage: body };
};

const createTestChannels = () => {
  createChannel("loaded", () => {
    (window as any).data("http://localhost:8081/");
    (window as any).css("* { color: white !important; }");
    (window as any).page("xhtml/epub30-overview.xhtml", 0);
  });

  let tested = false;

  createChannel("ready", () => {
    if (tested) {
      return;
    }

    tested = true;
    (window as any).pageGoAnchor(
      "xhtml/epub30-overview.xhtml",
      "sec-gls-container"
    );
  });
};

export default createTestChannels;
