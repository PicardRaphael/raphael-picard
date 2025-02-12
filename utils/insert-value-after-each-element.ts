export const insertValueAfterEachElement = (arr: string[], value: number): (string | number)[] => {
	return arr.flatMap((item) => [item, value]);
};
