export type StoreValue = any;

export type BasePubSub = Record<
  string | number | symbol,
  (...args: StoreValue) => void
>;
