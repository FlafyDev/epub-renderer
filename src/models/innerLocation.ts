interface InnerLocation {
  identifier: any;
  type: string;
}

export class InnerPage implements InnerLocation {
  identifier: number;
  type = "page";
  constructor(public innerPage: number) {
    this.identifier = innerPage;
  }
}

export class InnerAnchor implements InnerLocation {
  identifier: string;
  type = "anchor";
  constructor(public anchor: string) {
    this.identifier = anchor;
  }
}

export class InnerTextNode implements InnerLocation {
  identifier: string;
  type = "textNode";
  constructor(public textNodeIndex: number, public characterIndex: number) {
    this.identifier = `${textNodeIndex}-${characterIndex}`;
  }
}

export class InnerElement implements InnerLocation {
  type = "element";
  identifier: number;
  constructor(public elementIndex: number) {
    this.identifier = elementIndex;
  }
}

export default InnerLocation;
