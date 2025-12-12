# hd-pub-sub 事件系统

一个类型安全、轻量级的事件发布订阅系统，支持异步事件处理和灵活的订阅管理。

## 特性

- 🎯 **完全类型安全** - 使用 TypeScript 泛型提供完整的类型推断
- ⚡ **异步事件处理** - 所有监听器异步执行，避免阻塞主线程
- 🔧 **灵活订阅管理** - 支持批量取消订阅和指定监听器移除
- 🛡️ **错误处理** - 内置错误捕获和警告提示
- 📦 **零依赖** - 纯 TypeScript 实现，无需额外依赖

## 安装

```bash
npm install hd-pub-sub
# 或
yarn add hd-pub-sub
# 或
pnpm add hd-pub-sub
```

## 快速开始

### 1. 定义事件类型

首先，定义你的应用事件类型：

```typescript
// events.ts
export type AppEvents = {
  'user:login': (userId: string, timestamp: Date) => void;
  'user:logout': (userId: string) => void;
  'notification:new': (message: string, type: 'info' | 'warning' | 'error') => void;
  'cart:update': (itemCount: number, total: number) => void;
};
```

### 2. 创建 PubSub 实例

```typescript
// pubsub.ts
import createPubSub from 'hd-pub-sub';
import { AppEvents } from './events';

const pubSub = createPubSub<AppEvents>();

export default pubSub;
```

### 3. 使用事件系统

```typescript
import pubSub from './pubsub';

// 订阅事件
const handleLogin = (userId: string, timestamp: Date) => {
  console.log(`用户 ${userId} 登录于 ${timestamp}`);
};

pubSub.subscribe('user:login', handleLogin);

// 订阅仅触发一次事件
pubSub.subscribe('user:login', handleLogin, { once: true });

// 发布事件
pubSub.publish('user:login', 'user-123', new Date());

// 取消订阅特定监听器
pubSub.unsubscribe('user:login', handleLogin);

// 取消事件的所有监听器
pubSub.unsubscribe('user:login');

// 清除所有事件监听器
pubSub.unsubscribe();
```

## API 文档

### createPubSub<T extends BasePubSub>()

创建一个类型安全的事件发布订阅实例。

**类型参数：**

- T: 事件类型定义，必须是 Record<string | number | symbol, (...args: any) => void> 的子类型

**返回值：** 包含三个方法的对象：

- subscribe: 订阅事件
- unsubscribe: 取消订阅
- publish: 发布事件

### subscribe<K extends keyof T>(event: K, listener: T[K])

订阅指定事件。

**参数：**

- event: K - 事件名称
- listener: T[K] - 事件监听器函数

**特性：**

- 自动避免重复订阅同一监听器
- 重复订阅时会显示警告
- 自动创建新事件的监听器数组

**示例：**

```typescript 
pubSub.subscribe('notification:new', (message, type) => {
  console.log(`[${type}] ${message}`);
});
```

### unsubscribe<K extends keyof T>(event?: K, listener?: T[K])

取消事件订阅。

**参数组合和行为：**

| 参数组合                           | 行为                               |
| ---------------------------------- | ---------------------------------- |
| unsubscribe()                      | 清除所有事件的所有监听器           |
| unsubscribe('user:login')          | 清除 user:login 事件的所有监听器   |
| unsubscribe('user:login', handler) | 仅清除 user:login 事件的指定监听器 |

**示例：**

```typescript
// 情况1：清除所有监听器
pubSub.unsubscribe();

// 情况2：清除特定事件的所有监听器
pubSub.unsubscribe('user:login');

// 情况3：清除特定事件的特定监听器
const handler = (userId: string) => { /* ... */ };
pubSub.subscribe('user:logout', handler);
pubSub.unsubscribe('user:logout', handler);
```

### publish<K extends keyof T>(event: K, ...args: Parameters<T[K]>)

发布事件，触发所有订阅的监听器。

**参数：**

- event: K - 要发布的事件名称
- ...args: Parameters<T[K]> - 传递给监听器的参数

**特性：**

- 异步执行所有监听器（使用 setTimeout 延迟 0ms）
- 自动处理没有订阅者的情况
- 内置错误捕获，单个监听器错误不会影响其他监听器

**示例：**

```typescript
// 发布事件，自动推断参数类型
pubSub.publish('cart:update', 5, 199.99);

// 类型安全 - 下面的代码会报错：
// pubSub.publish('cart:update', 'five'); // 错误：参数类型不匹配
```

## 高级用法

### 创建多个独立的事件总线

```typescript
// 用户相关事件
const userEvents = createPubSub<{
  'profile:updated': (user: User) => void;
  'settings:changed': (settings: UserSettings) => void;
}>();

// 应用状态事件
const appEvents = createPubSub<{
  'app:loaded': () => void;
  'app:error': (error: Error) => void;
}>();

// UI 事件
const uiEvents = createPubSub<{
  'modal:open': (modalId: string) => void;
  'modal:close': (modalId: string) => void;
}>();
```

### 组合事件处理

```typescript
// 创建一个事件代理，将多个事件总线合并
const eventHub = {
  user: userEvents,
  app: appEvents,
  ui: uiEvents,
};

// 使用
eventHub.user.subscribe('profile:updated', handleProfileUpdate);
eventHub.app.publish('app:loaded');
```

### 错误处理示例

```typescript
pubSub.subscribe('app:error', (error: Error) => {
  // 发送错误到监控服务
  monitoringService.captureException(error);
  
  // 显示用户友好的错误消息
  if (error instanceof NetworkError) {
    showToast('网络连接失败，请检查网络设置');
  }
});

// 在应用中捕获并发布错误
try {
  // 某些可能失败的操作
} catch (error) {
  pubSub.publish('app:error', error);
}
```

### 性能优化技巧

```typescript
// 1. 避免在频繁触发的事件中使用昂贵的操作
pubSub.subscribe('scroll:position', (position) => {
  // 使用防抖或节流处理频繁事件
  debouncedUpdateUI(position);
});

// 2. 及时清理不再需要的事件监听器
class UserComponent {
  private loginHandler: (userId: string) => void;

  constructor() {
    this.loginHandler = this.handleLogin.bind(this);
    pubSub.subscribe('user:login', this.loginHandler);
  }

  destroy() {
    // 组件销毁时取消订阅
    pubSub.unsubscribe('user:login', this.loginHandler);
  }

  private handleLogin(userId: string) {
    // 处理登录逻辑
  }
}
```

### 类型定义

```typescript
// 基础事件类型
export type StoreValue = any;

export type BasePubSub = Record<
  string | number | symbol,
  (...args: StoreValue) => void
>;

// 创建函数类型
declare function createPubSub<T extends BasePubSub>(): {
  subscribe: <K extends keyof T>(event: K, listener: T[K]) => void;
  unsubscribe: <K extends keyof T>(event?: K, listener?: T[K]) => void;
  publish: <K extends keyof T>(event: K, ...args: Parameters<T[K]>) => Promise<void>;
};
```

### 注意事项

- 异步执行：所有监听器都是异步执行的，使用 setTimeout(fn, 0) 实现

- 执行顺序：监听器按订阅顺序执行，但因为是异步的，不能保证绝对的执行时机

- 内存管理：长时间运行的应用需要及时清理不再使用的监听器

- 错误隔离：单个监听器的错误不会影响其他监听器的执行

- 重复订阅：系统会自动检测并警告重复的监听器订阅

### 许可证

MIT

### 贡献指南

欢迎提交 Issue 和 Pull Request！