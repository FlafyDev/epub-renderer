import "./style.css";
import Page from "./components/page";
import createPage from "./createPage";
import lerp from "./utils/lerp";

const app = document.querySelector<HTMLDivElement>("#app")!;
app.style.width = "100vw";
app.style.height = "100vh";

const transition: {
  progress: number;
  targetProgress: number;
  mouseControl: boolean;
  startPos: number;
  currentPos: number;
  page: Page | null;
  animating: boolean;
} = {
  progress: 0,
  targetProgress: 0,
  mouseControl: false,
  startPos: 0,
  currentPos: 0,
  page: null,
  animating: false,
};
let currentPage: Page | null = null;

currentPage = await createPage(11, 1);
app.appendChild(currentPage.container);

transition.page = await createPage(13, 1);
transition.page.container.style.visibility = "hidden";
app.appendChild(transition.page.container);

app.addEventListener("mousedown", (e) => {
  if (!transition.animating) {
    transition.mouseControl = true;
    transition.startPos = e.x;

    updateTransition(e);
    updateProgressDisplay();
  }
});

app.addEventListener("mousemove", (e) => {
  if (transition.mouseControl) {
    updateTransition(e);
    updateProgressDisplay();
  }
});

app.addEventListener("mouseup", (e) => {
  if (transition.mouseControl) {
    transition.mouseControl = false;
    transition.page!.container.style.visibility = "hidden";
    transition.animating = true;

    updateTransition(e);
    updateProgressDisplay();
  }
});

const update: FrameRequestCallback = (time) => {
  if (transition.animating) {
    if (transition.progress <= 0.03 || transition.progress >= 1.97) {
      transition.animating = false;
      transition.progress = 0;
    } else {
      transition.progress = lerp(
        transition.progress,
        transition.targetProgress,
        0.2
      );
    }
    updateTransition();
  }

  window.requestAnimationFrame(update);
};
window.requestAnimationFrame(update);

const updateTransition = (e?: MouseEvent) => {
  if (e) {
    transition.progress =
      (e.x - transition.startPos + app.clientWidth) / app.clientWidth;
    transition.currentPos = e.x;
  }

  const progress = transition.progress ?? 0;

  transition.targetProgress = transition.progress > 1 ? 2 : 0;

  transition.page!.container.style.left = `${(1 - progress) * -100}vw`;
  transition.page!.container.style.visibility = "visible";
  transition.page!.container.style.zIndex = "100";

  currentPage!.element.style.opacity = Math.abs(1 - progress).toString();
  currentPage!.container.style.scale = (
    Math.abs(1 - progress) * 0.2 +
    0.8
  ).toString();
};

const progressElement = document.createElement("div");
progressElement.style.position = "fixed";
progressElement.style.inset = "0";
progressElement.style.userSelect = "none";
progressElement.style.color = "red";
progressElement.style.zIndex = "10000";
app.appendChild(progressElement);
const updateProgressDisplay = () => {
  progressElement.innerHTML = transition.progress?.toString() ?? "none";
};
updateProgressDisplay();

// document.body.appendChild(currentPage.element);

// console.log(parseInt(page.element.style.scale || "1"));
// notifyLoaded();
