interface InnerLocation {
  identifier: any;
}

export class InnerPage implements InnerLocation {
  identifier: number;
  constructor(public innerPage: number) {
    this.identifier = innerPage;
  }
}

export class InnerAnchor implements InnerLocation {
  identifier: string;
  constructor(public anchor: string) {
    this.identifier = anchor;
  }
}

export class InnerTextNode implements InnerLocation {
  identifier: string;
  constructor(public textNodeIndex: number, public characterIndex: number) {
    this.identifier = `${textNodeIndex}-${characterIndex}`;
  }
}

export class InnerElement implements InnerLocation {
  identifier: number;
  constructor(public elementIndex: number) {
    this.identifier = elementIndex;
  }
}

export default InnerLocation;
