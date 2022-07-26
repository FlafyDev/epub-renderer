import urlJoin from "url-join";
import Page, { StyleProperties } from "./components/page";
import {
  notifyLoad,
  notifyReady,
  notifySelection,
  onCSS,
  onPage,
  onPageAnchor,
  onPageElement,
  onPageTextNode,
  onClearSelection,
  onStyle,
  notifyLink,
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
    onPageAnchor(this.onPage.bind(this));
    onPageElement(this.onPage.bind(this));
    onPageTextNode(this.onPage.bind(this));
    onStyle(this.onStyle.bind(this));
    onCSS(this.onCSS.bind(this));
    onClearSelection(this.onClearSelection.bind(this));

    document.addEventListener("selectionchange", this.onSelection.bind(this));
    this.quickSelection.toggle(true);

    notifyLoad();
  }

  async processPage(page: Page) {
    console.log("waiting for links to load");
    await Promise.all(
      Array.from(page.container.querySelectorAll("link"))
        .filter((link) => !link.getAttribute("type")?.includes("adobe"))
        .map(
          (link) =>
            new Promise((resolve) => {
              link.onload = link.onerror = resolve;
            })
        )
    ).then(() => {
      console.log("links finished loading");
    });

    console.log("waiting for images to load");
    await Promise.all(
      Array.from(page.container.querySelectorAll("img"))
        .filter((img) => !img.complete)
        .map(
          (img) =>
            new Promise((resolve) => {
              img.onload = img.onerror = resolve;
            })
        )
    ).then(() => {
      console.log("images finished loading");
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

    if (
      innerLocation.identifier != this.pageInnerLocation?.identifier ||
      pageFilePath != this.pageFilePath
    ) {
      if (pageFilePath != this.pageFilePath) {
        // Recreate the page if the html is different

        window.history.pushState("", "", "/");
        const html = await (await fetch(pageFilePath)).text();

        this.page?.destroy();
        this.pageFilePath = pageFilePath;
        window.history.pushState("", "", pageFilePath);
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
    this.style = style;
    this.page?.unsafelySetStyle(style);
  }

  onCSS(css: string) {
    this.additionalCSSElement.innerHTML = css;
  }

  onPageReady() {
    notifyReady(
      this.page!.innerPage,
      this.page!.innerPages,
      this.page!.passedAnchors,
      this.page!.consistentInnerLocation!
    );
  }

  onClearSelection() {
    clearSelection();
  }
}

export default PageManager;
