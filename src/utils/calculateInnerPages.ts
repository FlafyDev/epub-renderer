const calculateInnerPages = (element: HTMLElement, side: number) => {
  // Equation: `entireWidth = columnWidth * innerPages + columnGap * (innerPages - 1) - (left + right) * innerPages`
  console.log("calculated");
  const entireWidth = element.scrollWidth;
  const styles = window.getComputedStyle(element);
  const columnWidth = parseFloat(styles.columnWidth);
  const columnGap = parseFloat(styles.columnGap);

  return Math.round(
    (entireWidth + columnGap) / (columnWidth + columnGap - side * 2)
  );
};

export default calculateInnerPages;
