export type StoreValue = any;

export type BasePubSub = Record<string | number | symbol, (...args: StoreValue) => void>;

export type SubscribeOptions = {
  once?: boolean;
};

export type Events<T> = Partial<Record<keyof T, { listener: T[keyof T]; options: SubscribeOptions }[]>>;
