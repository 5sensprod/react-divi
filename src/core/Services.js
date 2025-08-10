class Services {
  constructor() {
    this.s = new Map();
  }

  set(key, value) {
    this.s.set(key, value);
    return this;
  }

  get(key) {
    return this.s.get(key);
  }
}

export default Services;
