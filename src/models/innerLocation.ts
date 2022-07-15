interface InnerLocation {
  value: any;
}

export class InnerPage implements InnerLocation {
  constructor(public value: number) {}
}

export class InnerAnchor implements InnerLocation {
  constructor(public value: string) {}
}

export default InnerLocation;
