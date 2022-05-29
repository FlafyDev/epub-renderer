import Page from "./components/page";
import getPageData from "./getPageData";

const app = document.querySelector<HTMLDivElement>("#app")!;

const temporaryPageHolder = document.createElement("div");
temporaryPageHolder.style.visibility = "hidden";
app.appendChild(temporaryPageHolder);

const createPage = async (pageIndex: number, innerPage: number | "end") => {
  const pageComp = new Page(pageIndex);
  temporaryPageHolder.appendChild(pageComp.container);
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

const createNextPage = async (page: Page) => {
  if (page.innerPage === page.innerPages - 1) {
    return createPage(page.pageIndex + 1, 0);
  }
  return createPage(page.pageIndex, page.innerPage + 1);
};

const createPreviousPage = async (page: Page) => {
  if (page.innerPage === 0) {
    return createPage(page.pageIndex - 1, "end");
  }
  return createPage(page.pageIndex, page.innerPage - 1);
};

export { createNextPage, createPreviousPage };
export default createPage;
