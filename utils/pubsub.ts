type Callback<T = any> = (data: T) => void;

class PubSub {
  private events: Map<string, Callback[]>;

  constructor() {
    this.events = new Map();
  }

  on(event: string, callback: Callback): () => void {
    console.log(event, "event");
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);

    return () => this.off(event, callback);
  }

  broadcast<T = unknown>(event: string, data?: T): void {
    console.log("BroadCast Event", event);
    if (this.events.has(event)) {
      this.events.get(event)!.forEach((callback) => callback(data));
    }
  }

  off(event: string, callback: Callback): void {
    if (this.events.has(event)) {
      const newCallbacks = this.events
        .get(event)!
        .filter((cb) => cb !== callback);
      this.events.set(event, newCallbacks);
    }
  }

  clear(event: string): void {
    this.events.delete(event);
  }
}

export default new PubSub();
