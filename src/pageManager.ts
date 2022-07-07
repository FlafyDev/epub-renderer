import Page, { StyleProperties } from "./components/page";
import { notifyLoaded, notifyReady, onPage, onStyle } from "./flutterCom";

class PageManager {
  page: Page | null = null;
  style: StyleProperties = {
    margin: {
      side: 28,
      top: 50,
      bottom: 20,
    },
    fontSizePercentage: 1.125,
    lineHeightPercentage: 1.2,
    align: "left",
    fontFamily: "Arial",
  };

  constructor(public parent: HTMLElement) {
    onPage(this.onPage.bind(this));
    onStyle(this.onStyle.bind(this));
    notifyLoaded();
  }

  onPage(innerPage: number, html: string) {
    this.page = new Page(this.parent, innerPage, html, this.style);
    this.onPageReady();
  }

  onStyle(style: StyleProperties) {
    this.style = style;
  }

  onPageReady() {
    notifyReady(this.page!.innerPage, this.page!.innerPages);
  }
}

export default PageManager;
