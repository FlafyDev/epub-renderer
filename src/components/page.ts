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
  constructor() {
    this.element = document.createElement("div");
    this.element.style.columnWidth = "100vw";
    this.element.style.position = "fixed";
    this.element.style.inset = "0";
    this.element.style.wordSpacing = "2px";
    this.element.className = "page";

    window.addEventListener("resize", () => this.syncInnerPage());
  }

  public element: HTMLElement;
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
  public pageIndex: number | null = null;
  private _innerPage = 0;

  get innerPage() {
    return this._innerPage;
  }

  destroy = () => {
    this.element.remove();
  };

  /// Makes sure you're on the correct innerPage.
  syncInnerPage = async () => {
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
  };

  set innerPage(value: number) {
    this._innerPage = value;
    this.updateStyle();
  }

  renderHTML = (newHTML: string) => {
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
  };

  updateStyle = () => {
    this.element.style.textAlign = this.style.align;

    this.element.style.fontFamily = this.style.fontFamily;

    this.element.style.width = `calc(100vw - ${this.style.margin.side * 2}px)`;
    this.element.style.height = `calc(100vh - ${this.style.margin.top})`;
    this.element.style.margin = `${this.style.margin.top}px ${this.style.margin.side}px ${this.style.margin.bottom}px ${this.style.margin.side}px`;
    this.element.style.columnGap = `${this.style.margin.side}px`;

    const includeCalc = `${this.innerPage * 100}vw - ${
      this.style.margin.side
    }px * ${this.innerPage}`;
    this.element.style.clipPath = `inset(0 Calc((${includeCalc}) * -1) 0 Calc(${includeCalc})`;

    this.element.style.left = `calc((${this.innerPage * -100}vw + ${
      this.style.margin.side * this.innerPage
    }px) * ${this.element.style.scale || "1"})`;

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
