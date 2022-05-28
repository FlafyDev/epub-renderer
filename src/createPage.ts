import Page from "./components/page";
import getPageData from "./getPageData";

const app = document.querySelector<HTMLDivElement>("#app")!;

const temporaryPageHolder = document.createElement("div");
temporaryPageHolder.style.visibility = "hidden";
app.appendChild(temporaryPageHolder);

const createPage = async (page: number, innerPage: number) => {
  const pageComp = new Page();
  temporaryPageHolder.appendChild(pageComp.container);
  pageComp.renderHTML(await getPageData(page));
  pageComp.innerPage = innerPage;
  pageComp.syncInnerPage();
  return pageComp;
};

export default createPage;
