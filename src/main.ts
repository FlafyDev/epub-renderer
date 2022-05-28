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
  leftPage: Page | null;
  rightPage: Page | null;
  page: Page | null;
  animating: boolean;
} = {
  progress: 0,
  targetProgress: 0,
  mouseControl: false,
  startPos: 0,
  currentPos: 0,
  animating: false,
  leftPage: null,
  rightPage: null,
  page: null,
};
let currentPage: Page | null = null;
let pageIndex = 0;

currentPage = await createPage(pageIndex, 1);
app.appendChild(currentPage.container);

app.addEventListener("mousedown", async (e) => {
  if (!transition.animating && currentPage) {
    transition.mouseControl = true;
    transition.startPos = e.x;

    transition.leftPage?.destroy();
    transition.rightPage?.destroy();
    transition.page?.destroy();

    console.log(currentPage.container.parentElement);
    transition.page = currentPage;
    transition.leftPage = await createPage(pageIndex - 1, 1);
    transition.rightPage = await createPage(pageIndex + 1, 1);

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
    if (transition.progress <= -0.97 || transition.progress >= 0.97) {
      transition.animating = false;
      transition.progress = 0;
      transition.page?.destroy();
      transition.page = null;

      if (transition.targetProgress === 1) {
        currentPage = transition.rightPage;
        transition.rightPage = null;
        pageIndex++;
      } else {
        pageIndex--;
        currentPage = transition.leftPage;
        transition.leftPage = null;
      }
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
  if (transition.page) {
    if (e) {
      transition.progress = (transition.startPos - e.x) / app.clientWidth;
      transition.currentPos = e.x;
    }

    const progress = transition.progress ?? 0;

    transition.targetProgress = transition.progress >= 0 ? 1 : -1;

    let page: Page;

    if (transition.targetProgress === 1) {
      transition.leftPage?.container.remove();
      app.appendChild(transition.rightPage!.container);
      page = transition.rightPage!;
    } else {
      transition.rightPage?.container.remove();
      app.appendChild(transition.leftPage!.container);
      page = transition.leftPage!;
    }

    transition.page.container.style.left = `${progress * -100}vw`;
    transition.page.container.style.visibility = "visible";
    transition.page.container.style.zIndex = "100";

    page.element.style.opacity = Math.abs(progress).toString();
    page.container.style.scale = (Math.abs(progress) * 0.2 + 0.8).toString();
  }
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
