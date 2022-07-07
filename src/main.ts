import "./style.css";
import PageManager from "./pageManager";

const app = document.querySelector<HTMLDivElement>("#app")!;
app.style.width = "100vw";
app.style.height = "100vh";

new PageManager(app);
