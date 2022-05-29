import Page from "./components/page";
import createPage, { createNextPage, createPreviousPage } from "./createPage";
import lerp from "./utils/lerp";

class MouseControl {
  public isControlling: boolean = false;
  public startPosition: number = 0;
  public position: number = 0;
}

class PageManager {
  transitionProgress: number = 0;
  targetProgress: number = 0;
  mouseControl: MouseControl = new MouseControl();
  previousPage: Page | null = null;
  nextPage: Page | null = null;
  transitionPage: Page | null = null;
  isAnimating: boolean = false;
  currentPage: Page | null = null;

  constructor(public parent: HTMLElement, initialPage: number) {
    parent.addEventListener("mousedown", (e) => {
      e.preventDefault();
      this.mouseDown(e.x);
    });
    parent.addEventListener("mousemove", (e) => this.mouseMove(e.x));
    parent.addEventListener("mouseup", (e) => this.mouseUp(e.x));

    const animationFrame: FrameRequestCallback = (time) => {
      this.updateTransitionAnimation(time);
      window.requestAnimationFrame(animationFrame);
    };
    window.requestAnimationFrame(animationFrame);

    (async () => {
      this.currentPage = await createPage(initialPage, 0);
      this.parent.appendChild(this.currentPage.container);
    })();
  }

  mouseDown = async (position: number) => {
    if (!this.isAnimating && this.currentPage) {
      this.mouseControl.isControlling = true;
      this.mouseControl.startPosition = position;

      this.previousPage?.destroy();
      this.nextPage?.destroy();
      this.transitionPage?.destroy();

      this.transitionPage = this.currentPage;
      this.previousPage = await createPreviousPage(this.currentPage);
      this.nextPage = await createNextPage(this.currentPage);

      this.mouseControl.position = position;
      this.updateTransitionProgress();
      this.updateTransitionStyle();
    }
  };

  mouseMove = (position: number) => {
    if (this.mouseControl.isControlling) {
      this.mouseControl.position = position;
      this.updateTransitionProgress();
      this.updateTransitionStyle();
    }
  };

  mouseUp = (position: number) => {
    if (this.mouseControl.isControlling) {
      this.mouseControl.isControlling = false;
      this.transitionPage!.container.style.visibility = "hidden";
      this.isAnimating = true;

      this.mouseControl.position = position;
      this.updateTransitionProgress();
      this.updateTransitionStyle();
    }
  };

  updateTransitionAnimation: FrameRequestCallback = (_) => {
    if (this.isAnimating) {
      if (this.transitionProgress <= -0.97 || this.transitionProgress >= 0.97) {
        this.isAnimating = false;
        this.transitionProgress = 0;
        this.transitionPage?.destroy();
        this.transitionPage = null;

        if (this.targetProgress === 1) {
          this.currentPage = this.nextPage;
          this.nextPage = null;
        } else {
          this.currentPage = this.previousPage;
          this.previousPage = null;
        }
      } else {
        this.transitionProgress = lerp(
          this.transitionProgress,
          this.targetProgress,
          0.2
        );
      }

      this.updateTransitionStyle();
    }
  };

  updateTransitionProgress = () => {
    this.transitionProgress =
      (this.mouseControl.startPosition - this.mouseControl.position) /
      this.parent.clientWidth;
  };

  updateTransitionStyle = () => {
    if (this.transitionPage) {
      const progress = this.transitionProgress ?? 0;

      this.targetProgress = this.transitionProgress >= 0 ? 1 : -1;

      let page: Page;

      if (this.targetProgress === 1) {
        this.previousPage?.container.remove();
        this.parent.appendChild(this.nextPage!.container);
        page = this.nextPage!;
      } else {
        this.nextPage?.container.remove();
        this.parent.appendChild(this.previousPage!.container);
        page = this.previousPage!;
      }

      this.transitionPage.container.style.left = `${progress * -100}vw`;
      this.transitionPage.container.style.visibility = "visible";
      this.transitionPage.container.style.zIndex = "100";

      page.element.style.opacity = Math.abs(progress).toString();
      page.container.style.scale = (Math.abs(progress) * 0.2 + 0.8).toString();
    }
  };
}

export default PageManager;
