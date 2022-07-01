import Page from "./components/page";
import PageCreator from "./pageCreator";
import Transition from "./transitions/transition";
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
  pageCreator: PageCreator;
  previousTouch: Touch | null = null;

  constructor(
    public parent: HTMLElement,
    public transition: Transition,
    initialPage: number
  ) {
    // Mouse gestures
    parent.addEventListener("mousedown", (e) => {
      this.mouseDown(e.x);
    });
    parent.addEventListener("mousemove", (e) => {
      this.mouseMove(e.x, e.movementX);
    });
    parent.addEventListener("mouseup", (e) => this.mouseUp(e.x));

    // Touch gestures
    parent.addEventListener("touchstart", (e) => {
      const touch = e.touches[0];
      this.mouseDown(touch.clientX);
    });
    parent.addEventListener("touchmove", (e) => {
      const touch = e.touches[0];

      if (this.previousTouch) {
        const movementX = touch.clientX - this.previousTouch.clientX;
        this.mouseMove(touch.clientX, movementX);
      }

      this.previousTouch = touch;
    });
    parent.addEventListener("touchend", () => {
      this.mouseUp(this.previousTouch!.clientX);
    });

    this.pageCreator = new PageCreator(parent);

    const animationFrame: FrameRequestCallback = (time) => {
      this.updateTransitionAnimation(time);
      window.requestAnimationFrame(animationFrame);
    };
    window.requestAnimationFrame(animationFrame);

    this.initialize(initialPage);
  }

  private async initialize(initialPage: number) {
    this.currentPage = await this.pageCreator.createPage(initialPage, 0);
    this.parent.appendChild(this.currentPage.container);
    await this.animationDone();
  }

  mouseDown = async (position: number) => {
    if (
      !this.isAnimating &&
      this.currentPage &&
      !this.mouseControl.isControlling &&
      this.previousPage &&
      this.nextPage
    ) {
      this.mouseControl.isControlling = true;
      this.mouseControl.startPosition = position;

      this.transitionPage?.destroy();
      this.transitionPage = this.currentPage;

      this.targetProgress = 0;
      this.mouseControl.position = position;
      this.updateTransitionProgress();
      this.updateTransitionStyle();
    }
  };

  mouseMove = (position: number, delta: number) => {
    if (this.mouseControl.isControlling) {
      const mouseProgressPercentage = position / window.innerWidth;
      if (Math.abs(delta) >= 5) {
        this.targetProgress = delta < 0 ? 1 : -1;
      } else if (
        mouseProgressPercentage > 0.3 &&
        mouseProgressPercentage < 0.7
      ) {
        this.targetProgress = 0;
      }

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

  animationDone = async () => {
    this.previousPage?.destroy();
    this.nextPage?.destroy();
    this.previousPage = await this.pageCreator.createPreviousPage(
      this.currentPage!
    );
    this.nextPage = await this.pageCreator.createNextPage(this.currentPage!);
  };

  updateTransitionAnimation: FrameRequestCallback = (_) => {
    if (this.isAnimating) {
      if (this.targetProgress === 0) {
        if (
          this.transitionProgress >= -0.005 &&
          this.transitionProgress <= 0.005
        ) {
          this.isAnimating = false;
          this.transitionProgress = 0;
          this.currentPage = this.transitionPage;
          this.transitionPage = null;
          this.animationDone();
        }
      } else if (
        this.transitionProgress <= -0.97 ||
        this.transitionProgress >= 0.97
      ) {
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
        this.animationDone();
      }
      this.updateTransitionStyle(
        this.transitionPage === null &&
          this.transitionProgress === 0 &&
          this.targetProgress === 0
      );
      this.transitionProgress -= Math.min(
        this.transitionProgress -
          lerp(this.transitionProgress, this.targetProgress, 0.2),
        0.15
      );
    }
  };

  updateTransitionStyle = (back: boolean = false) => {
    const progress = this.transitionProgress ?? 0;

    const side = this.transitionProgress >= 0 ? 1 : -1;

    let newPage: Page | null = this.currentPage;

    if (this.nextPage === null || this.previousPage === null) {
      return;
    }

    if (this.transitionPage) {
      if (side === 1) {
        this.previousPage?.container.remove();
        this.parent.appendChild(this.nextPage!.container);
        newPage = this.nextPage!;
      } else {
        this.nextPage?.container.remove();
        this.parent.appendChild(this.previousPage!.container);
        newPage = this.previousPage!;
      }
    }

    // console.log(
    //   `transitionPage: ${
    //     (transitionPage ?? this.transitionPage)?.pageIndex
    //   } --- progress: ${progress}`
    // );

    this.transition.updateStyle(
      !this.nextPage || !this.previousPage ? 1 : progress,
      back ? newPage! : this.transitionPage,
      back ? null : newPage!
    );
  };

  updateTransitionProgress = () => {
    this.transitionProgress =
      (this.mouseControl.startPosition - this.mouseControl.position) /
      this.parent.clientWidth;
  };
}

export default PageManager;
