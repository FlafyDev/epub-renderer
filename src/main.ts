import "./style.css";
import PageManager from "./pageManager";
import { Swipe } from "./transitions";
// import { notifyLoaded, onMoveInnerPage, onSetLocation } from "./flutterCom";

const app = document.querySelector<HTMLDivElement>("#app")!;
app.style.width = "100vw";
app.style.height = "100vh";

new PageManager(app, new Swipe(), 0);

// onSetLocation((index, selector) => {});

// notifyLoaded();
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
