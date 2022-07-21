import urlJoin from "url-join";
import Page, { StyleProperties } from "./components/page";
import {
  notifyLink,
  notifyLoad,
  notifyReady,
  notifySelection,
  onCSS,
  onData,
  onPage,
  onPageGoAnchor,
  onClearSelection,
  onStyle,
} from "./controllerCom";
import InnerLocation from "./models/innerLocation";
import QuickSelection from "./quickSelection";
import { assert } from "./utils/assert";
import clearSelection from "./utils/clearSelection";

const isUrlRegex = new RegExp("^(?:[a-z+]+:)?//", "i");

class PageManager {
  page: Page | null = null;
  pageFilePath: string | null = null;
  pageInnerLocation: InnerLocation | null = null;
  queuedPage: { pageFilePath: string; innerLocation: InnerLocation } | null =
    null;
  makingPage: boolean = false;

  quickSelection = new QuickSelection();
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
    letterSpacingMultiplier: 1,
    wordSpacingMultiplier: 1,
    align: "left",
    fontFamily: "Arial",
    fontPath: "",
    fontWeight: "400",
  };

  constructor(public parent: HTMLElement) {
    this.additionalCSSElement = document.createElement("style");
    document.head.appendChild(this.additionalCSSElement);
    this.fontCSSElement = document.createElement("style");
    document.head.appendChild(this.fontCSSElement);

    onPage(this.onPage.bind(this));
    onPageGoAnchor(this.onPage.bind(this));
    onStyle(this.onStyle.bind(this));
    onCSS(this.onCSS.bind(this));
    onData(this.onData.bind(this));
    onClearSelection(this.onClearSelection.bind(this));

    document.addEventListener("selectionchange", this.onSelection.bind(this));
    this.quickSelection.toggle(true);

    notifyLoad();
  }

  async processPage(page: Page) {
    const pageFolderPathUrl = urlJoin(
      this.baseEPubUrl!,
      this.pageFilePath!,
      ".."
    );

    const modifyPath = (resourcePath: string) => {
      return urlJoin(pageFolderPathUrl, resourcePath);
    };

    const imgs = Array.from(page.container.getElementsByTagName("img"));
    const links = Array.from(page.container.getElementsByTagName("link"));

    await new Promise<void>((resolve) => {
      const requiresLoading = imgs.length + links.length;
      const loadedElements: HTMLElement[] = [];

      const timeout = setTimeout(() => {
        console.error("Timeout after 3 seconds while loading elements");
        resolve();
      }, 3000);

      const markLoaded = (element: HTMLElement) => {
        if (!loadedElements.includes(element)) {
          loadedElements.push(element);

          if (loadedElements.length == requiresLoading) {
            clearTimeout(timeout);
            resolve();
          }
        }
        console.log(`Loaded: ${loadedElements.length}/${requiresLoading}`);
      };

      imgs.forEach((image) => {
        image.src = modifyPath(image.getAttribute("src")!);
        image.addEventListener("load", () => markLoaded(image));
        // image.addEventListener("error", () => markLoaded(image));
      });

      // Mainly for css
      links.forEach((link) => {
        link.href = modifyPath(link.getAttribute("href")!);
        link.addEventListener("load", () => markLoaded(link));
        // link.addEventListener("error", () => markLoaded(link));
      });
    });

    Array.from(page.container.getElementsByTagName("a")).forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const href = a.getAttribute("href");
        if (href) {
          notifyLink(
            isUrlRegex.test(href)
              ? href
              : urlJoin(this.pageFilePath!, "..", href)
          );
        }
      });
    });
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

  async onPage(pageFilePath: string, innerLocation: InnerLocation) {
    if (this.makingPage) {
      this.queuedPage = { pageFilePath, innerLocation };
      return;
    }
    this.makingPage = true;

    // Do nothing if the page is already loaded
    if (
      innerLocation.value != this.pageInnerLocation?.value ||
      pageFilePath != this.pageFilePath
    ) {
      if (pageFilePath != this.pageFilePath) {
        // Recreate the page if the html is different
        const html = await (
          await fetch(urlJoin(this.baseEPubUrl!, pageFilePath))
        ).text();

        this.page?.destroy();
        this.pageFilePath = pageFilePath;
        this.page = new Page(this.parent, html!, this.style);
        await this.processPage(this.page);
        this.page.initialize();
      }

      assert(this.page != null, "Page should not be null");

      this.pageInnerLocation = innerLocation;
      this.page.innerPage =
        this.page.getInnerPageFromInnerLocation(innerLocation);
      this.page.applyStyleShowInnerPage();
    }

    this.makingPage = false;
    if (this.queuedPage) {
      this.onPage(this.queuedPage.pageFilePath, this.queuedPage.innerLocation);
    } else {
      this.onPageReady();
    }
  }

  onStyle(style: StyleProperties) {
    if (style.fontPath.length > 0) {
      this.fontCSSElement.innerHTML = `
      @font-face {
        font-family: 'FONT_NAME';
        src: url('${urlJoin(this.baseUrl!, style.fontPath)}');
      }
      `;
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
    notifyReady(
      this.page!.innerPage,
      this.page!.innerPages,
      this.page!.passedAnchors
    );
  }

  onClearSelection() {
    clearSelection();
  }
}

export default PageManager;
