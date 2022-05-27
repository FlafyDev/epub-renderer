import "./style.css";
import { notifyLoaded } from "./flutterCom";
import Page from "./components/page";
import getPageData from "./getPageData";

const app = document.querySelector<HTMLDivElement>("#app")!;
const transitionProgress: number | null = null;
let currentPage: Page | null = null;

const createPage = async (parent: Node, page: number, innerPage: number) => {
  const pageComp = new Page();
  parent.appendChild(pageComp.element);
  pageComp.renderHTML(await getPageData(page));
  pageComp.innerPage = innerPage;
  pageComp.syncInnerPage();
  return pageComp;
};

currentPage = await createPage(app, 10, 12);

// console.log(parseInt(page.element.style.scale || "1"));
// notifyLoaded();
