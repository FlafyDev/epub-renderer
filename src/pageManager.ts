import urlJoin from "url-join";
import Page, { StyleProperties } from "./components/page";
import {
  notifyLoaded,
  notifyReady,
  notifySelection,
  onCSS,
  onData,
  onPage,
  onStyle,
} from "./flutterCom";

class PageManager {
  page: Page | null = null;
  baseUrl: string | null = null;
  baseEPubUrl: string | null = null;
  additionalCSSElement: HTMLStyleElement;
  fontCSSElement: HTMLStyleElement;
  style: StyleProperties = {
    margin: {
      side: 28,
      top: 50,
      bottom: 20,
    },
    fontSizeMultiplier: 1.125,
    lineHeightMultiplier: 1.2,
    align: "left",
    fontFamily: "Arial",
    fontPath: "",
  };

  constructor(public parent: HTMLElement) {
    this.additionalCSSElement = document.createElement("style");
    document.head.appendChild(this.additionalCSSElement);
    this.fontCSSElement = document.createElement("style");
    document.head.appendChild(this.fontCSSElement);

    onPage(this.onPage.bind(this));
    onStyle(this.onStyle.bind(this));
    onCSS(this.onCSS.bind(this));
    onData(this.onData.bind(this));

    document.addEventListener("selectionchange", this.onSelection.bind(this));

    notifyLoaded();
  }

  processPage(page: Page) {
    const pageFilePath = urlJoin(this.baseEPubUrl!, page.pageFilePath, "..");

    const modifyPath = (resourcePath: string) => {
      return urlJoin(pageFilePath, resourcePath);
    };

    Array.from(page.container.getElementsByTagName("img")).forEach(
      (image) => (image.src = modifyPath(image.getAttribute("src")!))
    );

    Array.from(page.container.getElementsByTagName("link")).forEach(
      (link) => (link.href = modifyPath(link.getAttribute("href")!))
    );
  }

  onSelection() {
    const selection = window.getSelection()?.toString() ?? "";

    notifySelection(
      selection,
      selection.length > 0
        ? window.getSelection()!.getRangeAt(0).getBoundingClientRect()
        : new DOMRect(0, 0, 0, 0)
    );
  }

  async onPage(pageFilePath: string, innerPage: number) {
    if (this.page?.pageFilePath == pageFilePath) {
      this.page.innerPage = innerPage;
      this.page.applyStyleShowInnerPage();
      this.onPageReady();
    } else {
      const html = await (
        await fetch(urlJoin(this.baseEPubUrl!, pageFilePath))
      ).text();

      this.page = new Page(
        this.parent,
        innerPage,
        html!,
        this.style,
        pageFilePath
      );
      this.processPage(this.page);
      this.onPageReady();
    }
  }

  onStyle(style: StyleProperties) {
    if (style.fontPath.length > 0) {
      this.fontCSSElement.innerHTML = `
      @font-face {
        font-family: '${style.fontFamily}';
        src: url('${urlJoin(this.baseUrl!, style.fontPath)}');
      }
      `;

      console.log(this.fontCSSElement.innerHTML);
    }

    this.style = style;
  }

  onCSS(css: string) {
    this.additionalCSSElement.innerHTML = css;
  }

  onData(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.baseEPubUrl = urlJoin(baseUrl, "epub");
  }

  onPageReady() {
    notifyReady(this.page!.innerPage, this.page!.innerPages);
  }
}

export default PageManager;
