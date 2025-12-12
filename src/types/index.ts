export type StoreValue = any;

export type BasePubSub = Record<string | number | symbol, (...args: StoreValue) => void>;

export type SubscribeOptions = {
  once?: boolean;
};

export type Events<T> = Partial<Record<keyof T, { listener: T[keyof T]; options: SubscribeOptions }[]>>;

export type PubSub<T extends BasePubSub> = {
  subscribe: <K extends keyof T>(event: K, listener: T[K], options?: SubscribeOptions) => void;
  unsubscribe: <K extends keyof T>(event?: K, listener?: T[K]) => void;
  publish: <K extends keyof T>(event: K, ...args: Parameters<T[K]>) => void;
  events: Events<T>;
};
