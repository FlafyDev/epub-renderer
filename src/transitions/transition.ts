import Page from "../components/page";

abstract class Transition {
  abstract updateStyle(
    progress: number,
    transitionPage: Page | null,
    newPage: Page | null
  ): void;
}

export default Transition;
