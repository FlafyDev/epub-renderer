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
    const pageComp = new Page(
      this.temporaryPageHolder,
      pageIndex,
      innerPage === "end" ? -1 : innerPage,
      await getPageData(pageIndex),
      {
        margin: {
          side: 28,
          top: 50,
          bottom: 20,
        },
        fontSizePercentage: 1.125,
        lineHeightPercentage: 1.2,
        align: "left",
        fontFamily: "Arial",
      }
    );
    await pageComp.optimize();
    // pageComp.renderHTML();

    // pageComp.innerPage = 0;
    // if (innerPage === "end") {
    //   pageComp.firstVisibleElement = "end";
    // } else {
    //   pageComp.innerPage = innerPage;
    // }

    // pageComp.syncInnerPage();
    return pageComp;
  };

  createNextPage = async (page: Page) => {
    if (page.innerPage === page.innerPages - 1) {
      return await this.createPage(page.pageIndex + 1, 0);
    }
    return await this.createPage(page.pageIndex, page.innerPage + 1);
  };

  createPreviousPage = async (page: Page) => {
    if (page.innerPage === 0) {
      return await this.createPage(page.pageIndex - 1, "end");
    }
    return await this.createPage(page.pageIndex, page.innerPage - 1);
  };
}

export default PageCreator;
