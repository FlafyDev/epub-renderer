import { Dictionary } from "typescript-collections";

class States {
  private _innerPage = 0;
  private _margin = {
    side: 28,
    top: 50,
    bottom: 20,
  };
  private _fontSizePercentage = 1;
  private _lineHeightPercentage = 1;
  private _align: "left" | "center" | "right" | "justify" = "left";
  private _fontFamily: string = "Literata";

  constructor(
    public contentContainer: HTMLElement,
    public originalStyles: Dictionary<Element, CSSStyleDeclaration>
  ) {}

  get innerPage() {
    return this._innerPage;
  }

  set innerPage(value: number) {
    this._innerPage = value;
    this.contentContainer.style.left = `calc(${this._innerPage * -100}vw + ${
      this._margin.side * this._innerPage
    }px)`;
  }

  get align() {
    return this._align;
  }

  set align(value: typeof this._align) {
    this._align = value;
    this.contentContainer.style.textAlign = this._align;
  }

  get fontFamily() {
    return this._fontFamily;
  }

  set fontFamily(value: string) {
    this._fontFamily = value;
    this.contentContainer.style.fontFamily = this._fontFamily;
  }

  get margin() {
    return this._margin;
  }

  set margin(value: typeof this._margin) {
    if (value) this._margin = value;
    this.contentContainer.style.width = `calc(100vw - ${
      this._margin.side * 2
    }px)`;
    this.contentContainer.style.height = `calc(100vh - ${this._margin.top})`;
    this.contentContainer.style.margin = `${this._margin.top}px ${this._margin.side}px ${this._margin.bottom}px ${this._margin.side}px`;
    this.contentContainer.style.columnGap = `${this._margin.side}px`;
    this.innerPage = this._innerPage;
  }

  get fontSizePercentage() {
    return this._fontSizePercentage;
  }

  set fontSizePercentage(value: number) {
    this._fontSizePercentage = value;
    this.originalStyles.forEach((elem, orig) => {
      (elem as HTMLElement).style.fontSize = `${
        parseFloat(orig.fontSize) * this._fontSizePercentage
      }px`;
    });
  }

  get lineHeightPercentage() {
    return this._lineHeightPercentage;
  }

  set lineHeightPercentage(value: number) {
    this._lineHeightPercentage = value;
    this.originalStyles.forEach((elem, orig) => {
      (elem as HTMLElement).style.lineHeight = `${
        parseFloat(orig.lineHeight) * this._lineHeightPercentage
      }px`;
    });
  }
}

export { States };
