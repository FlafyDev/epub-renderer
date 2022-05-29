import "./style.css";
import PageManager from "./pageManager";
import { Swipe } from "./transitions";

const app = document.querySelector<HTMLDivElement>("#app")!;
app.style.width = "100vw";
app.style.height = "100vh";

const pageManager = new PageManager(app, new Swipe(), 0);

// const progressElement = document.createElement("div");
// progressElement.style.position = "fixed";
// progressElement.style.inset = "0";
// progressElement.style.userSelect = "none";
// progressElement.style.color = "red";
// progressElement.style.zIndex = "10000";
// app.appendChild(progressElement);
// const updateProgressDisplay = () => {
//   progressElement.innerHTML = transition.progress?.toString() ?? "none";
// };
// updateProgressDisplay();

// document.body.appendChild(currentPage.element);

// console.log(parseInt(page.element.style.scale || "1"));
// notifyLoaded();
