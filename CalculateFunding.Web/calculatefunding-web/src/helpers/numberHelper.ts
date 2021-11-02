// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const isNumber = (val: any): val is number => !Array.isArray(val) && val - parseFloat(val) + 1 >= 0;
