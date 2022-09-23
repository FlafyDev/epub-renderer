import urlJoin from "url-join";
import Page, { StyleProperties, StyleThemes } from "./components/page";
import {
  notifyLoad,
  notifyReady,
  notifySelection,
  onCSS,
  onPage,
  onPageAnchor,
  onPageElement,
  onPageNode,
  onPageTextNode,
  onClearSelection,
  onStyle,
  notifyLink,
  notifyNotePress,
} from "./controllerCom";
import InnerLocation from "./models/innerLocation";
import NoteData, { NoteRangeData } from "./models/noteData";
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
    weightMultiplier: 1,
    letterSpacingAdder: 0,
    wordSpacingAdder: 0,
    align: "left",
    fontFamily: "Arial",
    fontPath: "",
    theme: StyleThemes.dark,
  };

  constructor(public parent: HTMLElement) {
    this.additionalCSSElement = document.createElement("style");
    document.head.appendChild(this.additionalCSSElement);
    this.fontCSSElement = document.createElement("style");
    document.head.appendChild(this.fontCSSElement);

    onPage(this.onPage.bind(this));
    onPageAnchor(this.onPage.bind(this));
    onPageElement(this.onPage.bind(this));
    onPageNode(this.onPage.bind(this));
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
        .filter((link) => link.getAttribute("type") == "text/css")
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
          let link: string;
          link = href.trim();

          if (!isUrlRegex.test(href)) {
            switch (link[0]) {
              case "#":
                link = window.location.pathname + link;
                break;
              default:
                link = urlJoin(window.location.pathname, "..", link);
                break;
            }
          }

          if (link[0] === "/") {
            link = link.substring(1);
          }

          notifyLink(link);
        }
      });
    });
  }

  quickClicked = false;
  selectionDelay: NodeJS.Timeout | null = null;

  onSelection() {
    if (this.selectionDelay) {
      clearTimeout(this.selectionDelay);
    }
    this.selectionDelay = setTimeout(() => {
      const selection = window.getSelection();
      const text = selection?.toString() ?? "";
      const ranges: Range[] = [];

      if (selection) {
        for (let i = 0; i < selection.rangeCount; i++) {
          ranges.push(selection.getRangeAt(i));
        }
      }

      // const noteElementsKeys = [...this.page!.noteElements.keys()];

      // const selectedNoteIds = getNodesFromSelection(selection!)
      //   .map((node) =>
      //     noteElementsKeys.find((key) => {
      //       return this.page!.noteElements.get(key)?.includes(
      //         node.parentElement!
      //       );
      //     })
      //   )
      //   .filter((id) => typeof id === "string") as string[];

      notifySelection(
        text,
        ranges.map((range) => NoteRangeData.fromRange(this.page!, range)),
        text.length > 0
          ? window.getSelection()!.getRangeAt(0).getBoundingClientRect()
          : new DOMRect(0, 0, 0, 0)
      );
    }, 100);
  }

  onNotePress(noteId: string) {
    window.getSelection()?.removeAllRanges();
    notifyNotePress(noteId);
  }

  async onPage(
    pageFilePath: string,
    innerLocation: InnerLocation,
    forced: boolean,
    notesData: NoteData[]
  ) {
    notesData.forEach(
      (note) =>
        (note.ranges = note.ranges.map(
          (range) =>
            new NoteRangeData(
              range.startNodeIndex,
              range.startOffset,
              range.endNodeIndex,
              range.endOffset
            )
        ))
    );

    if (this.makingPage) {
      this.queuedPage = { pageFilePath, innerLocation };
      return;
    }
    this.makingPage = true;

    // TODO check both innerLocation type and identifier
    if (
      forced ||
      innerLocation.identifier != this.pageInnerLocation?.identifier ||
      pageFilePath != this.pageFilePath
    ) {
      if (forced || pageFilePath != this.pageFilePath) {
        // Recreate the page if the html is different

        window.history.pushState("", "", "/");
        const html = await (await fetch(pageFilePath)).text();

        this.page?.destroy();
        this.pageFilePath = pageFilePath;
        window.history.pushState("", "", pageFilePath);
        this.page = new Page(
          this.parent,
          html!,
          this.style,
          notesData,
          this.onNotePress.bind(this)
        );
        await this.processPage(this.page);
        this.page.initialize();
      }

      assert(this.page != null, "Page should not be null");

      this.pageInnerLocation = innerLocation;
      this.page.innerPage =
        this.page.getInnerPageFromInnerLocation(innerLocation);
      this.page.applyStyleShowInnerPage();
      // console.log(
      //   "originalNodesData",
      //   this.page.originalNodesData
      //     .filter((n) => n.type === 3)
      //     .map((n) => n.parts[0].node)
      // );
    }

    this.makingPage = false;
    if (this.queuedPage) {
      this.onPage(
        this.queuedPage.pageFilePath,
        this.queuedPage.innerLocation,
        forced,
        notesData
      );
    } else {
      this.onPageReady();
    }
  }

  onStyle(style: StyleProperties) {
    this.style = style;
    let theme: string;
    switch (style.theme) {
      case StyleThemes.light:
        theme = "light";
        break;
      case StyleThemes.dark:
        theme = "dark";
        break;
    }
    document.getElementsByTagName("html")[0].className = theme;
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
