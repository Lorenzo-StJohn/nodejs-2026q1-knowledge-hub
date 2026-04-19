export const Order = ['ASC', 'DESC'] as const;

export interface SortInterface<T extends Array<string>> {
  sortBy?: T[number];
  order?: (typeof Order)[number];
}
