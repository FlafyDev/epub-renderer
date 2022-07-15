const calculateInnerPages = (element: HTMLElement, side: number) => {
  // Equation: `entireWidth = columnWidth * innerPages + columnGap * (innerPages - 1) - (left + right) * innerPages`
  const entireWidth = element.scrollWidth;
  const styles = window.getComputedStyle(element);
  const columnWidth = parseFloat(styles.columnWidth);
  const columnGap = parseFloat(styles.columnGap) || 0;

  const innerPages =
    (entireWidth + columnGap) / (columnWidth + columnGap - side * 2);

  console.log(
    `innerPage calculation error: ${Math.round(innerPages) - innerPages}`
  );

  return Math.round(innerPages);
};

export default calculateInnerPages;
