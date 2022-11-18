export function groupBy<T, K extends keyof T, data>(
  array: T[],
  property: K,
  value: data
) {
  return array.filter((item) => {
    if (item[property] === value) return item;
  });
}
