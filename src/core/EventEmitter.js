class Emitter {
  constructor() {
    this.map = new Map();
  }

  on(event, fn) {
    const list = this.map.get(event) || [];
    list.push(fn);
    this.map.set(event, list);
    return () => this.off(event, fn);
  }

  off(event, fn) {
    this.map.set(
      event,
      (this.map.get(event) || []).filter((f) => f !== fn)
    );
  }

  emit(event, payload) {
    (this.map.get(event) || []).forEach((fn) => fn(payload));
  }
}

export default Emitter;
