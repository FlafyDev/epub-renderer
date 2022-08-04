interface InnerLocation {
  identifier: any;
  type: string;
}

export class InnerPage implements InnerLocation {
  identifier: string;
  type = "page";
  constructor(public innerPage: number) {
    this.identifier = this.type + innerPage;
  }
}

export class InnerAnchor implements InnerLocation {
  identifier: string;
  type = "anchor";
  constructor(public anchor: string) {
    this.identifier = this.type + anchor;
  }
}

export class InnerNode implements InnerLocation {
  identifier: string;
  type = "node";
  constructor(public nodeIndex: number, public characterIndex: number) {
    this.identifier = `${this.type}${nodeIndex}-${characterIndex}`;
  }
}

export class InnerTextNode implements InnerLocation {
  identifier: string;
  type = "textNode";
  constructor(public textNodeIndex: number, public characterIndex: number) {
    this.identifier = `${this.type}${textNodeIndex}-${characterIndex}`;
  }
}

export class InnerElement implements InnerLocation {
  type = "element";
  identifier: string;
  constructor(public elementIndex: number) {
    this.identifier = this.type + elementIndex;
  }
}

export default InnerLocation;
