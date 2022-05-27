import calculateInnerPages from "../utils/calculateInnerPages";
import clamp from "../utils/clamp";
import getSelector from "../utils/getSelector";
import findFirstVisibleElement from "../utils/findFirstVisibleElement";

interface StyleProperties {
  margin: {
    side: number;
    top: number;
    bottom: number;
  };
  fontSizePercentage: number;
  lineHeightPercentage: number;
  align: "left" | "center" | "right" | "justify";
  fontFamily: string;
}

class Page {
  constructor(public parentElement: HTMLElement) {
    this._id = `id${Math.random().toString(36).slice(2, 14)}`;

    this.element = document.createElement("div");
    this.element.id = this._id;
    this.element.style.columnWidth = "100vw";
    this.element.style.position = "fixed";
    this.element.style.inset = "0";
    this.element.style.wordSpacing = "2px";
    this.element.className = "page";

    this.styleElement = document.createElement("style");

    this.visible = true;

    this.parentElement.appendChild(this.element);
    this.parentElement.appendChild(this.styleElement);
    window.addEventListener("resize", () => this.syncInnerPage());
  }

  public element: HTMLElement;
  public styleElement: HTMLStyleElement;
  public firstVisibleElement: HTMLElement | null | "end" = null;
  public style: StyleProperties = {
    margin: {
      side: 28,
      top: 50,
      bottom: 20,
    },
    fontSizePercentage: 1.125,
    lineHeightPercentage: 1.2,
    align: "left",
    fontFamily: "Arial",
  };
  public innerPages = 0;
  public pageElements = new Map<
    string,
    {
      element: HTMLElement;
      originalStyles: { fontSize: string; lineHeight: string };
    }
  >();
  public smooth: boolean = false;
  public pageIndex: number | null = null;

  private _visible = false;
  private _loading = false;
  private _innerPage = 0;
  private _id;

  get innerPage() {
    return this._innerPage;
  }

  get visible() {
    return this._visible;
  }

  set visible(value: boolean) {
    this._visible = value;
    this.updateVisibility();
  }

  get loading() {
    return this._loading;
  }

  set loading(value: boolean) {
    this._loading = value;
    this.updateVisibility();
  }

  private updateVisibility() {
    this.element.style.visibility = this._visible ? "visible" : "hidden";
  }

  /// Makes sure you're on the correct innerPage.
  syncInnerPage = async () => {
    this.loading = true;
    this.innerPages = calculateInnerPages(this.element, this.style.margin.side);

    if (this.firstVisibleElement === "end") {
      this.innerPage = this.innerPages - 1;
    } else if (this.firstVisibleElement) {
      for (let i = 0; i < this.innerPages; i++) {
        this.innerPage = i;
        if (await findFirstVisibleElement([this.firstVisibleElement])) {
          break;
        }
      }
    } else {
      this.innerPage = clamp(this.innerPage, 0, this.innerPages - 1);
    }
    this.loading = false;
  };

  set innerPage(value: number) {
    this._innerPage = value;
    this.updateStyle();
  }

  renderHTML = (newHTML: string) => {
    this.loading = true;
    this.element.innerHTML = `${newHTML}`;

    this.pageElements.clear();

    this.element.querySelectorAll("*").forEach((elem) => {
      const styles = window.getComputedStyle(elem);
      this.pageElements.set(getSelector(elem), {
        element: elem as HTMLElement,
        originalStyles: {
          fontSize: styles.fontSize,
          lineHeight: styles.lineHeight,
        },
      });
    });
    this.loading = false;
  };

  updateStyle = () => {
    this.styleElement.innerHTML = `
    #${this._id} {
      position: absolute;
      content: "";
      z-index: -10;
      inset: -100px;
      width: ${this.element.scrollWidth}px;
      background-color: black;
    }`;

    this.element.style.transition = this.smooth
      ? "left 1s cubic-bezier(0.075, 0.82, 0.165, 1)"
      : "";

    this.element.style.textAlign = this.style.align;

    this.element.style.fontFamily = this.style.fontFamily;

    this.element.style.width = `calc(100vw - ${this.style.margin.side * 2}px)`;
    this.element.style.height = `calc(100vh - ${this.style.margin.top})`;
    this.element.style.margin = `${this.style.margin.top}px ${this.style.margin.side}px ${this.style.margin.bottom}px ${this.style.margin.side}px`;
    this.element.style.columnGap = `${this.style.margin.side}px`;

    this.element.style.left = `calc(${this.innerPage * -100}vw + ${
      this.style.margin.side * this.innerPage
    }px)`;

    this.pageElements.forEach((props) => {
      props.element.style.fontSize = `${
        parseFloat(props.originalStyles.fontSize) *
        this.style.fontSizePercentage
      }px`;

      props.element.style.lineHeight = `calc(${
        props.originalStyles.lineHeight === "normal"
          ? "1.5em"
          : props.originalStyles.lineHeight
      } * ${this.style.lineHeightPercentage})`;
    });
  };
}

export default Page;
