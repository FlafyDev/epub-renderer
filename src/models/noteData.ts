import Page from "../components/page";

const findNode = (nodes: Node[], offset: number): Node => {
  for (const node of nodes) {
    if (offset < (node.textContent?.length ?? 0)) {
      return node;
    }
  }
  return nodes[nodes.length - 1];
};

export class NoteRangeData {
  constructor(
    public startNodeIndex: number,
    public startOffset: number,
    public endNodeIndex: number,
    public endOffset: number
  ) {}

  toRange(page: Page): Range {
    const range = document.createRange();
    range.setStart(
      findNode(page.allNodes[this.startNodeIndex], this.startOffset),
      this.startOffset
    );
    range.setEnd(
      findNode(page.allNodes[this.endNodeIndex], this.endOffset),
      this.endOffset
    );
    return range;
  }

  static fromRange(page: Page, range: Range) {
    const startNodeIndex = page.allNodes.findIndex((nodes) =>
      nodes.includes(range.startContainer)
    );
    console.log(page.allNodes);
    const startOffset = range.startOffset;
    const endNodeIndex = page.allNodes.findIndex((nodes) =>
      nodes.includes(range.endContainer)
    );
    const endOffset = range.endOffset;
    return new NoteRangeData(
      startNodeIndex,
      startOffset,
      endNodeIndex,
      endOffset
    );
  }
}

class NoteData {
  constructor(
    public id: string,
    public ranges: NoteRangeData[],
    public color: "yellow"
  ) {}
}

export default NoteData;
