import Page, { OriginalNodeData } from "../components/page";

const findNode = (
  originalNodeData: OriginalNodeData,
  offset: number
): [Node, number] => {
  let passed = 0;
  for (const part of originalNodeData.parts) {
    const length = part.node.textContent?.length ?? 0;
    passed += part.preLength + length;
    if (offset <= passed) {
      return [part.node, passed - length];
    }
  }
  return [
    originalNodeData.parts[originalNodeData.parts.length - 1].node,
    passed,
  ];
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
    const startRes = findNode(
      page.originalNodesData[this.startNodeIndex],
      this.startOffset
    );
    console.log(startRes[0]);
    console.log(this.startOffset);
    console.log(startRes[1]);
    range.setStart(startRes[0], this.startOffset - startRes[1]);
    const endRes = findNode(
      page.originalNodesData[this.endNodeIndex],
      this.endOffset
    );
    console.log(this.endNodeIndex);
    console.log(this.endOffset);
    range.setEnd(endRes[0], this.endOffset - endRes[1]);
    return range;
  }

  static fromRange(page: Page, range: Range) {
    const startNodeIndex = page.originalNodesData.findIndex((ogData) =>
      ogData.parts.some((part) => part.node === range.startContainer)
    );
    const startOffset =
      range.startOffset +
      page.originalNodesData[startNodeIndex].parts.find(
        (part) => part.node == range.startContainer
      )!.preLength;
    const endNodeIndex = page.originalNodesData.findIndex((ogData) =>
      ogData.parts.some((part) => part.node === range.endContainer)
    );
    const endOffset =
      range.endOffset +
      page.originalNodesData[endNodeIndex].parts.find(
        (part) => part.node == range.endContainer
      )!.preLength;
    return new NoteRangeData(
      startNodeIndex,
      startOffset,
      endNodeIndex,
      endOffset
    );
  }
}

enum NoteDataColor {
  Yellow,
  Green,
  Blue,
  Red,
}

class NoteData {
  constructor(
    public id: string,
    public ranges: NoteRangeData[],
    public color: NoteDataColor,
    public hasDescription: boolean
  ) {}
}

export default NoteData;
