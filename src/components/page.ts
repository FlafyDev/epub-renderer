import InnerLocation, {
  InnerAnchor,
  InnerElement,
  InnerPage,
  InnerNode,
  InnerTextNode,
} from "../models/innerLocation";
import NoteData, { findNodeByOriginalNodeData } from "../models/noteData";
import calculateInnerPages from "../utils/calculateInnerPages";
import clamp from "../utils/clamp";
import findFirstVisibleElement from "../utils/findFirstVisibleElement";
import findFirstVisibleText from "../utils/findFirstVisibleText";
import getAllNodes from "../utils/getAllNodes";
// import getAllTextNodes from "../utils/getAllTextNodes";
import highlightElements from "../utils/highlightElements";
import nodeGetBoundingClientRect from "../utils/nodeGetBoundingClientRect";

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

const notesColorToName = ["yellow", "green", "blue", "red"];

export class OriginalNodeData {
  constructor(
    public parts: { node: Node; preLength: number }[],
    public type: number
  ) {}

  getOffsetOfNode(node: Node): number {
    const partIndex = this.parts.findIndex((part) => part.node == node);
    return (
      this.parts[partIndex].preLength +
      this.parts
        .filter((_, i) => i < partIndex)
        .reduce(
          (passed, part) =>
            passed + part.preLength + (part.node.textContent?.length ?? 0),
          0
        )
    );
  }
}

class Page {
  constructor(
    public readonly parent: Element,
    public readonly initialHtml: string,
    private _style: StyleProperties,
    notes: NoteData[],
    private readonly onNotePressed: (noteId: string) => void
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
    this._allAnchors = Array.from(this._element.querySelectorAll("[id]"));
    this._allElements = Array.from(this._element.querySelectorAll("*"));
    // const allTextNodes = getAllTextNodes(this._element).slice(1);
    this._originalNodesData = getAllNodes(this._element)
      .slice(1)
      .map(
        (node) =>
          new OriginalNodeData(
            [
              {
                node,
                preLength: 0,
              },
            ],
            node.nodeType
          )
      );

    notes.forEach((note) => {
      const ranges = note.ranges.map((rangeData) => {
        return rangeData.toRange(this);
      });

      const selection = window.getSelection();

      if (selection == null) return;

      selection.removeAllRanges();
      ranges.forEach((range) => selection.addRange(range));

      highlightElements(
        selection,
        [
          `__highlight-${notesColorToName[note.color]}`,
          "__note",
          `__note-id-${note.id}`,
          note.hasDescription ? "__note-has-desc" : "",
          "__highlight-bold",
        ].join(" "),
        this.originalNodesData
      );
    });

    window.getSelection()?.removeAllRanges();

    this._noteElements = new Map();

    Array.from(this._element.getElementsByClassName("__note")).map((node) => {
      const id =
        Array.from(node.classList)
          .find((className) => className.startsWith("__note-id"))
          ?.substring(10) ?? "";

      node.addEventListener("click", (e) => {
        e.preventDefault();
        this.onNotePressed(id);
      });

      if (this._noteElements.has(id)) {
        this._noteElements.set(id, this._noteElements.get(id)!.concat(node));
      } else {
        this._noteElements.set(id, [node]);
      }
    });
  }

  public passedAnchors: string[] = [];
  public container: HTMLElement;
  private _innerPage: number = 0;
  private _allAnchors;
  private _allElements;
  private _originalNodesData: OriginalNodeData[];
  private _noteElements: Map<string, Element[]>;
  public consistentInnerLocation: InnerElement | InnerNode | null = null;

  get style() {
    return this._style;
  }

  get innerPages() {
    return this._innerPages;
  }

  get innerPage() {
    return this._innerPage;
  }

  get originalNodesData() {
    return this._originalNodesData;
  }

  get noteElements() {
    return this._noteElements;
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
      return innerLocation.innerPage;
    } else if (innerLocation instanceof InnerAnchor) {
      try {
        const anchorElement = this._element.querySelector(
          `#${innerLocation.anchor}`
        );

        if (!anchorElement) {
          return 0;
        }

        return this._getInnerPageOfBoundingRect(
          anchorElement.getBoundingClientRect()
        );
      } catch {
        return 0;
      }
    } else if (innerLocation instanceof InnerElement) {
      try {
        const element = this._allElements[innerLocation.elementIndex];

        return this._getInnerPageOfBoundingRect(
          element.getBoundingClientRect()
        );
      } catch {
        return 0;
      }
    } else if (innerLocation instanceof InnerNode) {
      try {
        const res = findNodeByOriginalNodeData(
          this.originalNodesData[innerLocation.nodeIndex],
          innerLocation.characterIndex
        );

        return this._getInnerPageOfBoundingRect(
          nodeGetBoundingClientRect(
            res[0],
            innerLocation.characterIndex - res[1]
          )
        );
      } catch {
        return 0;
      }
    } else if (innerLocation instanceof InnerTextNode) {
      try {
        let textNodeIndex = 0;

        const res = findNodeByOriginalNodeData(
          this.originalNodesData.find((ogNodeData) => {
            if (ogNodeData.type == 3) {
              if (textNodeIndex == innerLocation.textNodeIndex) {
                return true;
              }
              textNodeIndex++;
            }
            return false;
          }) ?? this.originalNodesData[this.originalNodesData.length - 1],
          innerLocation.characterIndex
        );

        return this._getInnerPageOfBoundingRect(
          nodeGetBoundingClientRect(
            res[0],
            innerLocation.characterIndex - res[1]
          )
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

    const firstVisibleText = findFirstVisibleText(this._element);
    if (firstVisibleText == null) {
      const firstElement = findFirstVisibleElement(this._element);
      this.consistentInnerLocation = new InnerElement(
        this._allElements.findIndex((elem) => elem == firstElement)
      );
    } else {
      const nodeIndex = this.originalNodesData.findIndex((ogData) =>
        ogData.parts.some((part) => part.node === firstVisibleText[0])
      );

      this.consistentInnerLocation = new InnerNode(
        nodeIndex,
        firstVisibleText[1] +
          this.originalNodesData[nodeIndex].getOffsetOfNode(firstVisibleText[0])
      );
    }

    this.passedAnchors = this._allAnchors
      .filter(
        (anchor) =>
          this._getInnerPageOfBoundingRect(anchor.getBoundingClientRect()) <=
          this._innerPage
      )
      .map((anchor) => anchor.id);
  };

  _getInnerPageOfBoundingRect = (boundingRect: DOMRect) => {
    return Math.floor(
      this._getBoundingRectConsistentLeft(boundingRect) /
        (this._element.scrollWidth / this.innerPages)
    );
  };

  _getBoundingRectConsistentLeft = (boundingRect: DOMRect) => {
    return (
      boundingRect.left -
      Number(window.getComputedStyle(this._element).left.replace("px", ""))
    );
  };
}

export default Page;
