import "./style.css";
import PageManager from "./pageManager";
import createTestChannels from "./testing/createTestChannels";

const app = document.querySelector<HTMLDivElement>("#app")!;
app.style.width = "100vw";
app.style.height = "100vh";

window.oncontextmenu = function (event) {
  event.preventDefault();
  event.stopPropagation();
  return false;
};

createTestChannels();

new PageManager(app);
