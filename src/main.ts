import "./style.css";
import PageManager from "./pageManager";
import { createHandlers } from "./testing/handlersSimulator";

const app = document.querySelector<HTMLDivElement>("#app")!;
app.style.width = "100vw";
app.style.height = "100vh";

window.oncontextmenu = function (event) {
  event.preventDefault();
  event.stopPropagation();
  return false;
};

createHandlers();

// Wait for window.flutter_inappwebview to be defined as a function.
(async () => {
  await new Promise<void>(async (resolve) => {
    while (
      typeof (window as any).flutter_inappwebview?.callHandler !== "function"
    ) {
      await new Promise<void>((resolve) => setTimeout(resolve, 100));
    }
    resolve();
  });

  new PageManager(app);
})();
