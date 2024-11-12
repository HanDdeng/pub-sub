import { BasePubSub } from "./types";

const createPubSub = <T extends BasePubSub>() => {
  const events: Partial<Record<keyof T, T[keyof T][]>> = {}; // 存储所有的事件及其对应的回调函数

  // 订阅事件
  const subscribe = (event: keyof T, listener: T[keyof T]) => {
    // 如果事件不存在，创建一个空数组
    if (!events[event]) {
      events[event] = [];
    }

    // 判断监听器是否已经存在
    if (events[event].includes(listener)) {
      console.warn(`监听器已经存在: ${String(event)}`);
      return;
    }

    // 将订阅的监听函数推入该事件的队列
    events[event].push(listener);
  };

  /**
   * 取消订阅
   * @param event -非空时删除该事件全部监听器，不存在时全部监听器
   * @param listener -非空时删除指定监听器，不存在时删除该事件全部监听器
   */
  const unsubscribe = (event?: keyof T, listener?: T[keyof T]) => {
    if (!event) {
      // 如果未传入事件名称，则清空所有事件的监听器
      for (const key in events) {
        if (Object.prototype.hasOwnProperty.call(events, key)) {
          delete events[key];
        }
      }
      return;
    }

    if (!events[event]) return;

    if (listener) {
      // 过滤掉要取消的监听器
      events[event] = events[event].filter(
        currentListener => currentListener !== listener
      );
    } else {
      // 如果不传 listener，取消该事件的所有监听器
      delete events[event];
    }
  };

  // 发布事件
  const publish = async (event: keyof T, ...args: Parameters<T[keyof T]>) => {
    // 如果事件没有订阅者，直接返回
    if (!events[event]) return;

    // 执行所有订阅该事件的监听器，传递参数
    events[event].forEach(listener => {
      try {
        setTimeout(() => listener(...args), 0);
      } catch (e) {
        console.error(`监听器错误: ${String(event)}`, e);
      }
    });
  };

  return { subscribe, unsubscribe, publish };
};

export default createPubSub;
