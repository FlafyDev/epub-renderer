// https://stackoverflow.com/a/64565158/10849036

const intersection = (r1: DOMRect, r2: DOMRect) => {
  const xOverlap = Math.max(
    0,
    Math.min(r1.x + r1.width, r2.x + r2.width) - Math.max(r1.x, r2.x)
  );
  const yOverlap = Math.max(
    0,
    Math.min(r1.y + r1.height, r2.y + r2.height) - Math.max(r1.y, r2.y)
  );
  const overlapArea = xOverlap * yOverlap;

  return overlapArea;
};

const percentInView = (boundingRect: DOMRect) => {
  const rect = boundingRect;

  const dimension = new DOMRect(rect.x, rect.y, rect.width, rect.height);
  const viewport = new DOMRect(0, 0, window.innerWidth, window.innerHeight);
  const size = dimension.width * dimension.height;
  const overlap = intersection(dimension, viewport);

  return overlap / size;
};

export default percentInView;
