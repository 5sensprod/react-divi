const BlockRegistry = () => {
  const map = new Map();
  return {
    register(def) {
      map.set(def.type, def);
      return def;
    },
    get(type) {
      return map.get(type);
    },
    list() {
      return Array.from(map.values());
    },
  };
};

export default BlockRegistry;
