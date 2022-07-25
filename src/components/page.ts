import InnerLocation, { InnerAnchor, InnerPage } from "../models/innerLocation";
import calculateInnerPages from "../utils/calculateInnerPages";
import clamp from "../utils/clamp";

export interface StyleProperties {
  margin: {
    side: number;
    top: number;
    bottom: number;
  };
  fontSizeMultiplier: number;
  lineHeightMultiplier: number;
  align: "left" | "center" | "right" | "justify";
  fontFamily: string;
  fontPath: string;
  fontWeight: string;
  letterSpacingMultiplier: number;
  wordSpacingMultiplier: number;
}

class Page {
  constructor(
    public readonly parent: Element,
    public readonly initialHtml: string,
    private _style: StyleProperties
  ) {
    this._element = document.createElement("div");
    this._element.style.columnWidth = "100vw";
    this._element.style.position = "absolute";
    this._element.style.inset = "0";
    this._element.className = "page";

    this.container = document.createElement("div");
    this.container.style.position = "fixed";
    this.container.style.inset = "0";
    this.container.style.width = "100%";
    this.container.style.height = "100%";

    this.container.appendChild(this._element);
    this.parent.appendChild(this.container);

    this.renderHTML(initialHtml);
    this._allAnchors = Array.from(document.querySelectorAll("[id]"));
  }

  public passedAnchors: string[] = [];
  public container: HTMLElement;
  private _innerPage: number = 0;
  private _allAnchors;

  get style() {
    return this._style;
  }

  get innerPages() {
    return this._innerPages;
  }

  get innerPage() {
    return this._innerPage;
  }

  set innerPage(value: number) {
    this._innerPage = value;
    if (this._innerPage < 0) {
      this._innerPage = this.innerPages + this._innerPage;
    }

    this._innerPage = clamp(this._innerPage, 0, this.innerPages - 1);
  }

  private _innerPages = 0;
  private _element: HTMLElement;
  private _pageElements: {
    element: HTMLElement;
    originalStyles: {
      fontSize: string;
      lineHeight: string;
      letterSpacing: string;
      wordSpacing: string;
      textAlign: string;
      textIndent: string;
    };
  }[] = [];

  initialize = () => {
    this._element.querySelectorAll("*").forEach((elem) => {
      const styles = window.getComputedStyle(elem);
      this._pageElements.push({
        element: elem as HTMLElement,
        originalStyles: {
          fontSize: styles.fontSize,
          lineHeight: styles.lineHeight,
          letterSpacing: styles.letterSpacing,
          wordSpacing: styles.wordSpacing,
          textAlign: styles.textAlign,
          textIndent: styles.textIndent,
        },
      });
    });

    this.applyStyle();

    this._innerPages = calculateInnerPages(
      this._element,
      this.style.margin.side
    );

    console.log(`inner pages: ${this._innerPages}`);
  };

  getInnerPageFromInnerLocation = (innerLocation?: InnerLocation) => {
    if (innerLocation instanceof InnerPage) {
      return innerLocation.value;
    } else if (innerLocation instanceof InnerAnchor) {
      try {
        const anchorElement = this._element.querySelector(
          `#${innerLocation.value}`
        );

        if (!anchorElement) {
          return 0;
        }

        return Math.floor(
          this._getElementLeft(anchorElement) /
            (this._element.scrollWidth / this.innerPages)
        );
      } catch {
        return 0;
      }
    } else {
      return 0;
    }
  };

  destroy = () => {
    this.container.remove();
  };

  private renderHTML = (html: string) => {
    this._element.innerHTML = `${html}`;
  };

  private applyStyle = () => {
    this._element.style.width = `calc(100vw - ${this.style.margin.side * 2}px)`;
    this._element.style.height = `calc(100vh - ${this.style.margin.top}px - ${this.style.margin.bottom}px)`;
    this._element.style.margin = `${this.style.margin.top}px ${this.style.margin.side}px ${this.style.margin.bottom}px ${this.style.margin.side}px`;
    this._element.style.columnGap = `${this.style.margin.side}px`;

    this._pageElements.forEach((props) => {
      props.element.style.fontSize = `${
        parseFloat(props.originalStyles.fontSize) *
        this.style.fontSizeMultiplier
      }px`;

      props.element.style.lineHeight = `calc(${
        props.originalStyles.lineHeight === "normal"
          ? "1.5em"
          : props.originalStyles.lineHeight
      } * ${this.style.lineHeightMultiplier})`;

      props.element.style.letterSpacing = `calc(${
        props.originalStyles.letterSpacing === "normal"
          ? "0"
          : props.originalStyles.letterSpacing
      } * ${this.style.letterSpacingMultiplier})`;

      props.element.style.wordSpacing = `calc(${
        props.originalStyles.wordSpacing === "normal"
          ? "2px"
          : props.originalStyles.wordSpacing
      } * ${this.style.wordSpacingMultiplier})`;

      props.element.style.fontWeight = this.style.fontWeight;

      if (props.originalStyles.textAlign === "center") {
        props.element.style.textIndent = "0px";
      } else {
        props.element.style.textIndent = props.originalStyles.textIndent;
        props.element.style.textAlign = this.style.align;
      }

      if (this.style.fontFamily.length > 0) {
        props.element.style.fontFamily = this.style.fontFamily;
      } else {
        props.element.style.fontFamily = "";
      }

      // if (props.element.tagName === "IMG") {
      //   props.element.style.maxWidth = `calc(100vw - ${
      //     this.style.margin.side * 2
      //   }px)`;
      //   props.element.style.maxHeight = `calc(100vh - ${this.style.margin.top}px - ${this.style.margin.bottom}px)`;
      // }
    });
  };

  unsafelySetStyle = (style: StyleProperties) => {
    this._style = style;
    this.applyStyle();
  };

  applyStyleShowInnerPage = () => {
    // The clipPath css property is extremely weird to calculate to show only the current page
    // because it thinks the whole element is just the first page.
    const includeCalc = `${this.innerPage * 100}vw - ${
      this.style.margin.side
    }px * ${this.innerPage}`;
    this._element.style.clipPath = `inset(0 Calc((${includeCalc}) * -1) 0 Calc(${includeCalc})`;

    this._element.style.left = `calc(${this.innerPage * -100}vw + ${
      this.style.margin.side * this.innerPage
    }px)`;

    this.passedAnchors = this._allAnchors
      .filter(
        (anchor) =>
          Math.floor(
            this._getElementLeft(anchor) /
              (this._element.scrollWidth / this.innerPages)
          ) <= this._innerPage
      )
      .map((anchor) => anchor.id);
  };

  _getElementLeft = (element: Element) => {
    return (
      element.getBoundingClientRect().left -
      Number(window.getComputedStyle(this._element).left.replace("px", ""))
    );
  };
}

export default Page;
