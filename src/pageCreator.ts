import Page from "./components/page";
import getPageData from "./getPageData";

class PageCreator {
  temporaryPageHolder: HTMLElement;

  constructor(public parent: HTMLElement) {
    this.temporaryPageHolder = document.createElement("div");
    this.temporaryPageHolder.style.visibility = "hidden";
    this.parent.appendChild(this.temporaryPageHolder);
  }

  createPage = async (pageIndex: number, innerPage: number | "end") => {
    const pageComp = new Page(pageIndex);
    this.temporaryPageHolder.appendChild(pageComp.container);
    pageComp.renderHTML(await getPageData(pageIndex));

    pageComp.innerPage = 0;
    if (innerPage === "end") {
      pageComp.firstVisibleElement = "end";
    } else {
      pageComp.innerPage = innerPage;
    }

    pageComp.syncInnerPage();
    return pageComp;
  };

  createNextPage = async (page: Page) => {
    if (page.innerPage === page.innerPages - 1) {
      return this.createPage(page.pageIndex + 1, 0);
    }
    return this.createPage(page.pageIndex, page.innerPage + 1);
  };

  createPreviousPage = async (page: Page) => {
    if (page.innerPage === 0) {
      return this.createPage(page.pageIndex - 1, "end");
    }
    return this.createPage(page.pageIndex, page.innerPage - 1);
  };
}

export default PageCreator;
