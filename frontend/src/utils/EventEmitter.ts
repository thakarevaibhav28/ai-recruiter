export const EventEmitter = {
    _events: {} as any,
    dispatch: function (event: any, data: any) {
      if (!this._events[event]) return;
      this._events[event].forEach((callback: any) => callback(data));
    },
    subscribe: function (event: any, callback: any) {
      if (!this._events[event]) this._events[event] = [];
      this._events[event].push(callback);
    },
    get: function (event: any) {
      if (!this._events[event]) return this._events[event];
    },
  };