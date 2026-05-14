(function () {
  const root = (window.PixelRPG = window.PixelRPG || {});

  class Inventory {
    constructor() {
      this.items = new Map();
    }

    add(name, amount = 1) {
      const current = this.items.get(name) || 0;
      this.items.set(name, current + amount);
    }

    remove(name, amount = 1) {
      const current = this.items.get(name) || 0;
      const next = current - amount;
      if (next > 0) {
        this.items.set(name, next);
      } else {
        this.items.delete(name);
      }
    }

    has(name, amount = 1) {
      return (this.items.get(name) || 0) >= amount;
    }

    entries() {
      return Array.from(this.items.entries());
    }

    toSummary() {
      const entries = this.entries();
      if (entries.length === 0) {
        return "Nothing yet.";
      }

      return entries.map(([name, amount]) => `${name} x${amount}`).join(", ");
    }
  }

  root.Inventory = Inventory;
})();
