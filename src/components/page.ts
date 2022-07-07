import calculateInnerPages from "../utils/calculateInnerPages";
import clamp from "../utils/clamp";

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
  constructor(
    public readonly parent: Element,
    private _innerPage: number,
    html: string,
    private readonly style: StyleProperties
  ) {
    this._element = document.createElement("div");
    this._element.style.columnWidth = "100vw";
    this._element.style.position = "absolute";
    this._element.style.inset = "0";
    this._element.style.wordSpacing = "2px";
    this._element.className = "page";

    this.container = document.createElement("div");
    this.container.style.background = "black";
    this.container.style.position = "fixed";
    this.container.style.inset = "0";
    this.container.style.width = "100%";
    this.container.style.height = "100%";

    this.container.appendChild(this._element);
    this.parent.appendChild(this.container);

    this.renderHTML(html);
    this.applyStyle();

    this._innerPages = calculateInnerPages(
      this._element,
      this.style.margin.side
    );

    console.log(`inner pages: ${this._innerPages}`);

    if (this._innerPage < 0) {
      this._innerPage = this.innerPages + this._innerPage;
    }

    this._innerPage = clamp(this._innerPage, 0, this.innerPages - 1);

    this.applyStyleShowInnerPage();
  }

  public container: HTMLElement;

  get innerPages() {
    return this._innerPages;
  }

  get innerPage() {
    return this._innerPage;
  }

  private _innerPages = 0;
  private _element: HTMLElement;
  private _pageElements: {
    element: HTMLElement;
    originalStyles: { fontSize: string; lineHeight: string };
  }[] = [];

  destroy = () => {
    this.container.remove();
  };

  private renderHTML = (html: string) => {
    this._element.innerHTML = `${html}`;

    this._element.querySelectorAll("*").forEach((elem) => {
      // const styles = window.getComputedStyle(elem);
      this._pageElements.push({
        element: elem as HTMLElement,
        originalStyles: {
          fontSize: "",
          lineHeight: "",
        },
      });
    });
  };

  private applyStyle = () => {
    this._element.style.textAlign = this.style.align;

    this._element.style.fontFamily = this.style.fontFamily;

    this._element.style.width = `calc(100vw - ${this.style.margin.side * 2}px)`;
    this._element.style.height = `calc(100vh - ${this.style.margin.top}px - ${this.style.margin.bottom}px)`;
    this._element.style.margin = `${this.style.margin.top}px ${this.style.margin.side}px ${this.style.margin.bottom}px ${this.style.margin.side}px`;
    this._element.style.columnGap = `${this.style.margin.side}px`;

    this._pageElements.forEach((props) => {
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

  private applyStyleShowInnerPage = () => {
    // The clipPath css property is extremely weird to calculate to show only the current page
    // because it thinks the whole element is just the first page.
    const includeCalc = `${this.innerPage * 100}vw - ${
      this.style.margin.side
    }px * ${this.innerPage}`;
    this._element.style.clipPath = `inset(0 Calc((${includeCalc}) * -1) 0 Calc(${includeCalc})`;

    this._element.style.left = `calc(${this.innerPage * -100}vw + ${
      this.style.margin.side * this.innerPage
    }px)`;
  };

  optimize = async () => {
    await new Promise<void>((resolve) => {
      let observed = 0;
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          observed++;

          const element = entry.target as HTMLElement;
          if (entry.intersectionRatio > 0) {
            // element.style.display = 'none';
          } else {
            element.style.display = "none";
          }
        });
        if (observed >= this._pageElements.length) {
          observer.disconnect();
          resolve();
        }
      });

      this._pageElements.forEach((prop) => {
        observer.observe(prop.element);
      });
    });

    this._element.style.clipPath = "";

    this._element.style.left = "";
  };
}

export default Page;
