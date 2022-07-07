import "./style.css";
import PageManager from "./pageManager";

const app = document.querySelector<HTMLDivElement>("#app")!;
app.style.width = "100vw";
app.style.height = "100vh";

new PageManager(app);

// const pageComp = new Page(app, 1, 0, await getPageData(1), {
//   margin: {
//     side: 28,
//     top: 50,
//     bottom: 20,
//   },
//   fontSizePercentage: 1.125,
//   lineHeightPercentage: 1.2,
//   align: "left",
//   fontFamily: "Arial",
// });

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
