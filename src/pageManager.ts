import Page from "./components/page";
import { notifyLoaded, notifyReady, onPage } from "./flutterCom";

class PageManager {
  page: Page | null = null;

  constructor(public parent: HTMLElement) {
    onPage(this.onPage.bind(this));
    notifyLoaded();
  }

  onPage(innerPage: number, html: string) {
    this.page = new Page(this.parent, innerPage, html, {
      margin: {
        side: 28,
        top: 50,
        bottom: 20,
      },
      fontSizePercentage: 1.125,
      lineHeightPercentage: 1.2,
      align: "left",
      fontFamily: "Arial",
    });
    this.onPageReady();
  }

  onPageReady() {
    notifyReady(this.page!.innerPage, this.page!.innerPages);
  }
}

export default PageManager;
