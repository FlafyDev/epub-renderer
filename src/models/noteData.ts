import Page, { OriginalNodeData } from "../components/page";

export const findNodeByOriginalNodeData = (
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
    const startRes = findNodeByOriginalNodeData(
      page.originalNodesData[this.startNodeIndex],
      this.startOffset
    );
    range.setStart(startRes[0], this.startOffset - startRes[1]);
    const endRes = findNodeByOriginalNodeData(
      page.originalNodesData[this.endNodeIndex],
      this.endOffset
    );
    range.setEnd(endRes[0], this.endOffset - endRes[1]);
    return range;
  }

  static fromRange(page: Page, range: Range) {
    const startNodeIndex = page.originalNodesData.findIndex((ogData) =>
      ogData.parts.some((part) => part.node === range.startContainer)
    );
    const startOffset =
      range.startOffset +
      page.originalNodesData[startNodeIndex].getOffsetOfNode(
        range.startContainer
      );

    const endNodeIndex = page.originalNodesData.findIndex((ogData) =>
      ogData.parts.some((part) => part.node === range.endContainer)
    );
    const endOffset =
      range.endOffset +
      page.originalNodesData[endNodeIndex].getOffsetOfNode(range.endContainer);

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
