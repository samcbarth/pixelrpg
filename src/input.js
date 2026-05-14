(function () {
  const root = (window.PixelRPG = window.PixelRPG || {});

  class InputManager {
    constructor() {
      this.down = new Set();
      this.pressed = new Set();

      window.addEventListener("keydown", (event) => {
        if (!this.down.has(event.code)) {
          this.pressed.add(event.code);
        }
        this.down.add(event.code);
      });

      window.addEventListener("keyup", (event) => {
        this.down.delete(event.code);
      });

      window.addEventListener("blur", () => {
        this.down.clear();
        this.pressed.clear();
      });
    }

    isDown(...codes) {
      return codes.some((code) => this.down.has(code));
    }

    consumePressed(...codes) {
      return codes.some((code) => {
        if (this.pressed.has(code)) {
          this.pressed.delete(code);
          return true;
        }
        return false;
      });
    }
  }

  root.InputManager = InputManager;
})();
