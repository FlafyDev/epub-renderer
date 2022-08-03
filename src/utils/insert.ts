const insert = <T>(arr: T[], index: number, ...newItems: T[]) => [
  // part of the array before the specified index
  ...arr.slice(0, index),
  // inserted items
  ...newItems,
  // part of the array after the specified index
  ...arr.slice(index),
];

export default insert;
