import Page from "../components/page";
import Transition from "./transition";

export class Swipe implements Transition {
  updateStyle(
    progress: number,
    transitionPage: Page | null,
    newPage: Page | null
  ): void {
    if (transitionPage) {
      transitionPage.container.style.left = `${progress * -100}vw`;
      transitionPage.container.style.visibility = "visible";
      transitionPage.container.style.zIndex = "100";
    }

    if (newPage) {
      newPage.element.style.opacity = Math.abs(progress).toString();
      newPage.container.style.scale = (
        Math.abs(progress) * 0.2 +
        0.8
      ).toString();
    }
  }
}

export default Swipe;
