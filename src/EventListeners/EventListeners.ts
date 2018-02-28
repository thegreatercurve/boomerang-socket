export interface IEventStore {
  [event: string]: EventListener[];
}

export class EventListeners {
  private store: IEventStore;

  constructor() {
    this.store = {};
  }

  public attach(ws: WebSocket) {
    Object.keys(this.store).map((e: string) => {
      this.store[e].map(cb => {
        ws.addEventListener(e, cb);
      });
    });
  }

  public publish = (e: Event) => {
    const { type } = e;

    if (this.store[type]) {
      this.store[type].map((cb: EventListener) => cb.call(window, e));
    }
  };

  public remove(e: string, fn: EventListener) {
    this.store[e].forEach((cb, i) => {
      if (fn === cb) {
        this.store[e].splice(i, 1);
      }
    });
  }

  public subscribe = (e: string, fn: EventListener) => {
    if (!this.store[e]) {
      this.store[e] = [];
    }

    this.store[e].push(fn);
  };
}

export default new EventListeners();
